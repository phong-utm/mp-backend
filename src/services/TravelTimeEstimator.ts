import { TripLink } from "../domain/model"
import OperationalDbContext from "./interfaces/dao/OperationalDbContext"
import EstTravelTimeDAO from "./interfaces/dao/EstTravelTimeDAO"
import RouteDAO from "./interfaces/dao/RouteDAO"
import TripLinkDAO from "./interfaces/dao/TripLinkDAO"

export default class TravelTimeEstimator {
  private tripLinkDao: TripLinkDAO
  private routeDao: RouteDAO
  private estTravelTimeDao: EstTravelTimeDAO
  private filterErrors = new Map<string, number>() // linkId -> Kalman filter error

  constructor(operationalDb: OperationalDbContext) {
    this.tripLinkDao = operationalDb.getTripLinkDAO()
    this.routeDao = operationalDb.getRouteDAO()
    this.estTravelTimeDao = operationalDb.getEstTravelTimeDAO()
  }

  async estimateForTrip(
    tripId: string,
    info: {
      routeId: string
      scheduledStart: string
      dayId: number
    }
  ) {
    const { routeId, scheduledStart, dayId } = info
    const [routeData, historicalTrips, prevTrip] = await Promise.all([
      this.routeDao.findById(routeId),
      this.tripLinkDao.forHistoricalTrips(routeId, scheduledStart, dayId),
      this.tripLinkDao.forPrevTripSameDay(routeId, scheduledStart, dayId),
    ])

    const estLinkTravelTimes = routeData!.links.map(({ id: linkId }) => {
      // prettier-ignore
      const estimatedTime = this.estimateForLink(linkId, historicalTrips, prevTrip)
      return { tripId, linkId, estimatedTime }
    })

    await this.estTravelTimeDao.add(estLinkTravelTimes)
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
