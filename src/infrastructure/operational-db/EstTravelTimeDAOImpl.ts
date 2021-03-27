import { Model as SequelizeModel } from "sequelize"

import EstTravelTimeDAO from "../../services/interfaces/dao/EstTravelTimeDAO"
import { EstTravelTime } from "../../domain/model"
import { EstTravelTimeDbModel } from "./models/EstTravelTimeDbModel"

export default class EstTravelTimeDAOImpl implements EstTravelTimeDAO {
  constructor(private EstTravelTimeModel: EstTravelTimeDbModel) {}

  async add(records: EstTravelTime[]) {
    await this.EstTravelTimeModel.bulkCreate(records)
  }

  async forTrip(tripId: string) {
    const records = await this.EstTravelTimeModel.findAll({
      where: {
        tripId,
      },
    })

    return records.map(toDomainObject)
  }
}

const toDomainObject = (sequelizeObj: SequelizeModel<EstTravelTime>) =>
  ({
    tripId: sequelizeObj.getDataValue("tripId"),
    linkId: sequelizeObj.getDataValue("linkId"),
    estimatedTime: sequelizeObj.getDataValue("estimatedTime"),
  } as EstTravelTime)
