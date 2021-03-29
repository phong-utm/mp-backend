import { Model as SequelizeModel } from "sequelize"

import TripLinkDAO from "../../services/interfaces/dao/TripLinkDAO"
import { TripLink } from "../../domain/model"
import { TripLinkDbModel } from "./models/TripLinkDbModel"

const QUERY_HISTORICAL_TRIPS = `
SELECT lnk.*
  FROM TripLinks lnk
  JOIN (
    SELECT tripId
	    FROM Trips
	   WHERE routeId = :route
	     AND scheduledStart = :start
       AND dayId < :day 
  ORDER BY dayId DESC
     LIMIT :numberOfTrips
  ) trp ON lnk.tripId = trp.tripId
`

const QUERY_PREV_TRIP = `
SELECT lnk.*
  FROM TripLinks lnk
  JOIN (
    SELECT tripId
	    FROM Trips
	   WHERE routeId = :route
	     AND scheduledStart < :start
       AND dayId = :day
  ORDER BY scheduledStart DESC
     LIMIT 1
  ) trp ON lnk.tripId = trp.tripId;
`

export default class TripLinkDAOImpl implements TripLinkDAO {
  constructor(private TripLinkModel: TripLinkDbModel) {}

  async add(record: TripLink) {
    await this.TripLinkModel.create(record)
  }

  async forHistoricalTrips(
    routeId: string,
    scheduledStart: string,
    dayId: number,
    numberOfTrips: number
  ) {
    const links = await this.TripLinkModel.sequelize!.query(
      QUERY_HISTORICAL_TRIPS,
      {
        replacements: {
          route: routeId,
          start: scheduledStart,
          day: dayId,
          numberOfTrips,
        },
        mapToModel: true,
        model: this.TripLinkModel,
        // logging: true,
      }
    )

    return links.map(toDomainObject)
  }

  async forPrevTripSameDay(
    routeId: string,
    scheduledStart: string,
    dayId: number
  ) {
    const links = await this.TripLinkModel.sequelize!.query(QUERY_PREV_TRIP, {
      replacements: {
        route: routeId,
        start: scheduledStart,
        day: dayId,
      },
      mapToModel: true,
      model: this.TripLinkModel,
      // logging: true,
    })

    return links.map(toDomainObject)
  }
}

function toDomainObject(sequelizeObj: SequelizeModel<TripLink>): TripLink {
  return {
    tripId: sequelizeObj.getDataValue("tripId"),
    linkId: sequelizeObj.getDataValue("linkId"),
    travelledTime: sequelizeObj.getDataValue("travelledTime"),
    actualArrival: sequelizeObj.getDataValue("actualArrival"),
  }
}
