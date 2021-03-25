import EstTravelTimeDAO from "../../services/interfaces/dao/EstTravelTimeDAO"
import { EstTravelTime } from "../../domain/model"
import { EstTravelTimeDbModel } from "./models/EstTravelTimeDbModel"

export default class EstTravelTimeDAOImpl implements EstTravelTimeDAO {
  constructor(private EstTravelTimeModel: EstTravelTimeDbModel) {}

  async add(records: EstTravelTime[]) {
    await this.EstTravelTimeModel.bulkCreate(records)
  }
}
