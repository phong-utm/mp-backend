import TripDAO from "../../services/interfaces/dao/TripDAO"
import RouteDAO from "../../services/interfaces/dao/RouteDAO"
import { Trip } from "../../domain/model"
import { TripDbModel } from "./models/TripDbModel"

export default class TripDAOImpl implements TripDAO {
  constructor(private TripModel: TripDbModel, private routeDao: RouteDAO) {}

  async add(record: Trip) {
    await this.TripModel.create(record)
  }

  async getRouteForTrip(tripId: string) {
    const trip = await this.TripModel.findByPk(tripId)
    if (!trip) {
      throw new Error(`Trip not found: ${tripId}.`)
    }

    const routeData = await this.routeDao.findById(trip.getDataValue("routeId"))
    return routeData!
  }
}
