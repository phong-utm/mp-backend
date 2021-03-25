import PubSub from "./interfaces/PubSub"
import TripProgress from "../domain/TripProgress"
import { Coordinates, Trip } from "../domain/model"
import OperationalDbContext from "./interfaces/dao/OperationalDbContext"
import { generateGUID } from "../common/helpers"
import RouteDAO from "./interfaces/dao/RouteDAO"
import TripDAO from "./interfaces/dao/TripDAO"
import TripLinkDAO from "./interfaces/dao/TripLinkDAO"

export default class TripsTracker {
  private tripProgressById = new Map<string, TripProgress>()
  private routeDao: RouteDAO
  private tripDao: TripDAO
  private tripLinkDao: TripLinkDAO

  constructor(private pubsub: PubSub, operationalDb: OperationalDbContext) {
    this.routeDao = operationalDb.getRouteDAO()
    this.tripDao = operationalDb.getTripDAO()
    this.tripLinkDao = operationalDb.getTripLinkDAO()
  }

  async startTrip(info: {
    routeId: string
    scheduledStart: string
    dayId: number
  }) {
    const { routeId, scheduledStart, dayId } = info
    const routeData = await this.routeDao.findById(routeId)
    if (!routeData) {
      throw new Error(`Data not found for route ${routeId}.`)
    }

    // create new trip
    const tripId = generateGUID()
    await this.tripDao.add({ tripId, routeId, scheduledStart, dayId })

    // start tracking trip's progress
    const progress = new TripProgress(routeData)
    this.tripProgressById.set(tripId, progress)

    // emit event
    this.pubsub.publishTripStarted({ tripId, info })

    return tripId
  }

  async updateLocation(tripId: string, location: Coordinates, time: Date) {
    const prevProgress = this.tripProgressById.get(tripId)
    if (!prevProgress) {
      throw new Error(`No progress found for trip ${tripId}.`)
    }

    const progress = prevProgress.proceedTo(location, time)
    this.tripProgressById.set(tripId, progress)

    if (progress.currentLink!.isEnded) {
      const { linkId, travelledTime } = progress.currentLink!
      await this.tripLinkDao.add({
        tripId,
        linkId,
        travelledTime: Math.round(travelledTime / 1000),
      })

      // console.log(`Link ended: ${progress.currentLink!.linkId}`)
      if (progress.isEnded) {
        // TODO: emit "TripEnded"
        // console.log(`Trip ended!!!`)
        this.tripProgressById.delete(tripId)
      } else {
        // TODO: emit "LinkEnded"
      }
    } else {
      // const { travelledTime, remainingDistance } = progress.currentLink!
      // TODO: emit "MidLink"
      // console.log(
      //   `${time} Travelled time: ${travelledTime}, distance to link end: ${remainingDistance}`
      // )
    }
  }
}
