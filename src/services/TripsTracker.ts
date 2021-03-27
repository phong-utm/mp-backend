import PubSub from "./interfaces/PubSub"
import TripProgress from "../domain/TripProgress"
import { Coordinates } from "../domain/model"
import OperationalDbContext from "./interfaces/dao/OperationalDbContext"
import RouteDAO from "./interfaces/dao/RouteDAO"
import TripDAO from "./interfaces/dao/TripDAO"
import TripLinkDAO from "./interfaces/dao/TripLinkDAO"
import { generateGUID } from "../common/helpers"

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

      if (progress.isEnded) {
        this.tripProgressById.delete(tripId)
        this.pubsub.publishTripEnded({ tripId })
      }
    } else {
      const { linkId, travelledTime, remainingDistance } = progress.currentLink!
      this.pubsub.publishMidLink({
        tripId,
        linkId,
        linkTravelledTime: travelledTime,
        linkRemainingDistance: remainingDistance,
        timestamp: time.getTime(),
      })
    }
  }
}
