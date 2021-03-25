import OperationalDbContext from "./interfaces/dao/OperationalDbContext"
import TripLinkDAO from "./interfaces/dao/TripLinkDAO"

export default class TravelTimeEstimator {
  private tripLinkDao: TripLinkDAO

  constructor(operationalDb: OperationalDbContext) {
    this.tripLinkDao = operationalDb.getTripLinkDAO()
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
    const [historicalTrips, prevTrip] = await Promise.all([
      this.tripLinkDao.forHistoricalTrips(routeId, scheduledStart, dayId),
      this.tripLinkDao.forPrevTripSameDay(routeId, scheduledStart, dayId),
    ])
    console.log(prevTrip)
  }
}
