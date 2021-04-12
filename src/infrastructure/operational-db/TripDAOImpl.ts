import { Model as SequelizeModel, QueryTypes } from "sequelize"

import TripDAO from "../../services/interfaces/dao/TripDAO"
import RouteDAO from "../../services/interfaces/dao/RouteDAO"
import { Trip } from "../../domain/model"
import { TripDbModel } from "./models/TripDbModel"

const DELETE_TRIPLINK_ESTIMATE = `
DELETE tbl
  FROM TripLinkEstimate tbl
  JOIN Trips trp
    ON tbl.tripId = trp.tripId
 WHERE dayId BETWEEN :from AND :to
`
const DELETE_TRIPLINK_SCHEDULE = `
DELETE tbl
  FROM TripLinkSchedule tbl
  JOIN Trips trp
    ON tbl.tripId = trp.tripId
 WHERE dayId BETWEEN :from AND :to
`
const DELETE_TRIPLINK = `
DELETE tbl
  FROM TripLinks tbl
  JOIN Trips trp
    ON tbl.tripId = trp.tripId
 WHERE dayId BETWEEN :from AND :to
`
const DELETE_TRIP = `DELETE FROM Trips WHERE dayId BETWEEN :from AND :to`

function getPeriodBounds(period: string) {
  const year = parseInt(period.substring(0, 4))
  return period.endsWith("S1")
    ? [year * 10000 + 101, year * 10000 + 630] // 1-Jan to 30-Jun
    : [year * 10000 + 701, year * 10000 + 1231] // 1-Jul to 31-Dec
}

export default class TripDAOImpl implements TripDAO {
  constructor(private TripModel: TripDbModel, private routeDao: RouteDAO) {}

  async add(record: Trip) {
    await this.TripModel.create(record)
  }

  async findById(id: string) {
    const obj = await this.TripModel.findByPk(id)
    return obj ? toDomainObject(obj) : undefined
  }

  async delete(tripId: string) {
    return (await this.TripModel.destroy({ where: { tripId } })) === 1
  }

  async deleteForMonth(monthId: number) {
    await this.deleteForDuration(monthId * 100 + 1, monthId * 100 + 31)
  }

  async deleteForPeriod(period: string) {
    const [fromDayId, toDayId] = getPeriodBounds(period)
    await this.deleteForDuration(fromDayId, toDayId)
  }

  private async deleteForDuration(fromDayId: number, toDayId: number) {
    await Promise.all([
      this.deleteWithQuery(DELETE_TRIPLINK_ESTIMATE, fromDayId, toDayId),
      this.deleteWithQuery(DELETE_TRIPLINK_SCHEDULE, fromDayId, toDayId),
      this.deleteWithQuery(DELETE_TRIPLINK, fromDayId, toDayId),
    ])
    await this.deleteWithQuery(DELETE_TRIP, fromDayId, toDayId)
  }

  private async deleteWithQuery(
    query: string,
    fromDayId: number,
    toDayId: number
  ) {
    await this.TripModel.sequelize!.query(query, {
      replacements: {
        from: fromDayId,
        to: toDayId,
      },
      type: QueryTypes.DELETE,
    })
  }

  // async getRouteForTrip(tripId: string) {
  //   const trip = await this.TripModel.findByPk(tripId)
  //   if (!trip) {
  //     throw new Error(`Trip not found: ${tripId}.`)
  //   }

  //   const routeData = await this.routeDao.findById(trip.getDataValue("routeId"))
  //   return routeData!
  // }
}

function toDomainObject(sequelizeObj: SequelizeModel<Trip>): Trip {
  return {
    tripId: sequelizeObj.getDataValue("tripId"),
    routeId: sequelizeObj.getDataValue("routeId"),
    dayId: sequelizeObj.getDataValue("dayId"),
    scheduledStart: sequelizeObj.getDataValue("scheduledStart"),
    driver: sequelizeObj.getDataValue("driver"),
  }
}
