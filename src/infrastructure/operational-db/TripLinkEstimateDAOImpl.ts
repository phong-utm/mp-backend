import { Model as SequelizeModel } from "sequelize"

import TripLinkEstimateDAO from "../../services/interfaces/dao/TripLinkEstimateDAO"
import { TripLinkEstimate } from "../../domain/model"
import { TripLinkEstimateDbModel } from "./models/TripLinkEstimateDbModel"

export default class TripLinkEstimateDAOImpl implements TripLinkEstimateDAO {
  constructor(private TripLinkEstimateModel: TripLinkEstimateDbModel) {}

  async add(records: TripLinkEstimate[]) {
    await this.TripLinkEstimateModel.bulkCreate(records)
  }

  async forTrip(tripId: string) {
    const records = await this.TripLinkEstimateModel.findAll({
      where: {
        tripId,
      },
    })

    return records.map(toDomainObject)
  }
}

function toDomainObject(
  sequelizeObj: SequelizeModel<TripLinkEstimate>
): TripLinkEstimate {
  return {
    tripId: sequelizeObj.getDataValue("tripId"),
    linkId: sequelizeObj.getDataValue("linkId"),
    estimatedTime: sequelizeObj.getDataValue("estimatedTime"),
  }
}
