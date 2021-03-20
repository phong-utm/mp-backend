import PubSub from "./interfaces/PubSub"
import TripProgress from "../domain/TripProgress"
import { Coordinates, TripId, TripLink } from "../domain/model"
import OperationalDbContext from "./interfaces/dao/OperationalDbContext"

export default class TripsTracker {
  private tripProgressById = new Map<TripId, TripProgress>()

  constructor(
    private pubsub: PubSub,
    private operationalDb: OperationalDbContext
  ) {}

  async updateLocation(tripId: TripId, location: Coordinates, time: Date) {
    const progress = await this.initOrUpdateTripProgress(tripId, location, time)
    if (progress.isEnded) {
      // TODO: emit "LinkEnded" then "TripEnded"
      console.log(`Link ended: ${progress.currentLink.linkId}`)
      console.log(`Trip ended!!!`)
      this.tripProgressById.delete(tripId)
    } else if (progress.currentLink.isEnded) {
      const { linkId, travelledTime } = progress.currentLink

      // save link travelled time into database
      const record = new TripLink(tripId, linkId)
      record.travelledTime = Math.round(travelledTime / 1000)
      await this.operationalDb.getTripLinkDAO().add(record)
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
      const routeData = await this.operationalDb
        .getRouteDAO()
        .findById(tripId.routeId)

      progress = new TripProgress(routeData!, time)
    }

    // save the progress and return
    this.tripProgressById.set(tripId, progress)
    return progress
  }
}
