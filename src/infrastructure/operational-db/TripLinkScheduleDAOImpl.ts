// import { Model as SequelizeModel } from "sequelize"

import TripLinkScheduleDAO from "../../services/interfaces/dao/TripLinkScheduleDAO"
import { TripLinkSchedule } from "../../domain/model"
import { TripLinkScheduleDbModel } from "./models/TripLinkScheduleDbModel"

export default class TripLinkScheduleDAOImpl implements TripLinkScheduleDAO {
  constructor(private TripLinkScheduleModel: TripLinkScheduleDbModel) {}

  async add(records: TripLinkSchedule[]) {
    await this.TripLinkScheduleModel.bulkCreate(records)
  }

  // async forTrip(tripId: string) {
  //   const records = await this.TripLinkScheduleModel.findAll({
  //     where: {
  //       tripId,
  //     },
  //   })

  //   return records.map(toDomainObject)
  // }
}

// function toDomainObject(
//   sequelizeObj: SequelizeModel<TripLinkSchedule>
// ): TripLinkSchedule {
//   return {
//     tripId: sequelizeObj.getDataValue("tripId"),
//     linkId: sequelizeObj.getDataValue("linkId"),
//     scheduledArrival: sequelizeObj.getDataValue("scheduledArrival"),
//   }
// }
