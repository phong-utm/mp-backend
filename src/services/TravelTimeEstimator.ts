import { EstTravelTime, RouteData, TripLink } from "../domain/model"
import OperationalDbContext from "./interfaces/dao/OperationalDbContext"
import TripLinkDAO from "./interfaces/dao/TripLinkDAO"

export default class TravelTimeEstimator {
  private tripLinkDao: TripLinkDAO
  private filterErrors = new Map<string, number>() // linkId -> Kalman filter error

  constructor(operationalDb: OperationalDbContext) {
    this.tripLinkDao = operationalDb.getTripLinkDAO()
  }

  async estimateForTrip(
    tripId: string,
    info: {
      routeId: string
      scheduledStart: string
      dayId: number
      routeData: RouteData
    }
  ) {
    const { routeId, scheduledStart, dayId, routeData } = info
    const [historicalTrips, prevTrip] = await Promise.all([
      this.tripLinkDao.forHistoricalTrips(routeId, scheduledStart, dayId, 7),
      this.tripLinkDao.forPrevTripSameDay(routeId, scheduledStart, dayId),
    ])

    const estLinkTravelTimes: EstTravelTime[] = routeData.links.map(
      ({ id: linkId }) => {
        // prettier-ignore
        const estimatedTime = this.estimateForLink(linkId, historicalTrips, prevTrip)
        return { tripId, linkId, estimatedTime: Math.round(estimatedTime) }
      }
    )

    return estLinkTravelTimes
  }

  private estimateForLink(
    linkId: string,
    historicalTrips: TripLink[],
    prevTrip: TripLink[]
  ) {
    const isFirstTripOfDay = prevTrip.length === 0
    const prevFilterErr = this.filterErrors.get(linkId)
    const latestLinkTravelTime = getLatestLinkTravelTime(prevTrip, linkId)
    // prettier-ignore
    const [avgHistTravelTime, travelTimeVar] = calculateHistTravelTime(historicalTrips, linkId)

    // prettier-ignore
    const filterGain = isFirstTripOfDay || prevFilterErr === undefined
        ? 1
        : (prevFilterErr + travelTimeVar) / (prevFilterErr + 2 * travelTimeVar)

    // prettier-ignore
    const result = filterGain * avgHistTravelTime + (1 - filterGain) * latestLinkTravelTime

    this.filterErrors.set(linkId, filterGain * travelTimeVar)
    return result
  }
}

function calculateHistTravelTime(historicalTrips: TripLink[], linkId: string) {
  const travelTimes = historicalTrips
    .filter((t) => t.linkId === linkId)
    .map((t) => t.travelledTime)

  if (travelTimes.length === 0) {
    throw new Error(`No historical data found for link ${linkId}.`)
  }

  const avgTravelTime =
    travelTimes.reduce((sum, time) => sum + time, 0) / travelTimes.length

  // prettier-ignore
  const travelTimeVar =
    travelTimes.reduce((sum, time) => sum + Math.pow(time - avgTravelTime, 2), 0) / travelTimes.length

  return [avgTravelTime, travelTimeVar]
}

function getLatestLinkTravelTime(prevTrip: TripLink[], linkId: string) {
  const linkTravelTimes = prevTrip.filter((t) => t.linkId === linkId)
  return linkTravelTimes.length > 0 ? linkTravelTimes[0].travelledTime : 0
}
