import TripDAO from "../../services/interfaces/dao/TripDAO"
import { Trip } from "../../domain/model"
import { TripDbModel } from "./models/TripDbModel"

export default class TripDAOImpl implements TripDAO {
  constructor(private TripModel: TripDbModel) {}

  async add(record: Trip) {
    await this.TripModel.create(record)
  }
}
