import PubSub from "./interfaces/PubSub"
import TripProgress from "../domain/TripProgress"
import { Coordinates, TripId } from "../domain/model"
import RouteRepository from "../domain/interfaces/RouteRepository"

export default class TripsTracker {
  private tripProgressById = new Map<TripId, TripProgress>()

  constructor(private pubsub: PubSub, private routeRepo: RouteRepository) {}

  async updateLocation(tripId: TripId, location: Coordinates, time: Date) {
    const progress = await this.initOrUpdateTripProgress(tripId, location, time)
    if (progress.isEnded) {
      // TODO: emit "LinkEnded" then "TripEnded"
      console.log(`Link ended: ${progress.currentLink.linkId}`)
      console.log(`Trip ended!!!`)
      this.tripProgressById.delete(tripId)
    } else if (progress.currentLink.isEnded) {
      const { linkId, travelledTime } = progress.currentLink
      // TODO: emit "LinkEnded"
      console.log(`${linkId} travelled time: ${travelledTime / 1000}`)
    } else {
      const { travelledTime, remainingDistance } = progress.currentLink
      // TODO: emit "MidLink"
      // console.log(
      //   `${time} Travelled time: ${travelledTime}, distance to link end: ${remainingDistance}`
      // )
    }
  }

  private async initOrUpdateTripProgress(
    tripId: TripId,
    location: Coordinates,
    time: Date
  ) {
    let progress: TripProgress

    // update trip progress if it already exists, otherwise create a new trip progress
    const prevProgress = this.tripProgressById.get(tripId)
    if (prevProgress) {
      progress = prevProgress.proceedTo(location, time)
    } else {
      const routeData = await this.routeRepo.findById(tripId.routeId)
      progress = new TripProgress(routeData!, time)
    }

    // save the progress and return
    this.tripProgressById.set(tripId, progress)
    return progress
  }
}
