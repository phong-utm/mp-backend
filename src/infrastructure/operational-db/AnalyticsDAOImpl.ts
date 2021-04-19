import { Sequelize, QueryTypes } from "sequelize"

import AnalyticsDAO from "../../services/interfaces/dao/AnalyticsDAO"

const QUERY_HEADWAY_STD = `
SELECT STD(abs(lnk.headway)) AS metric
  FROM TripLinks lnk
  JOIN Trips trp
    ON lnk.tripId = trp.tripId
 WHERE dayId BETWEEN :from AND :to
   AND lnk.headway IS NOT NULL
`
const QUERY_AWT = `
SELECT SUM(headway * headway) / (2 * SUM(abs(headway)) * 60) AS metric
  FROM TripLinks lnk
  JOIN Trips trp
    ON lnk.tripId = trp.tripId
 WHERE dayId BETWEEN :from AND :to
   AND lnk.headway IS NOT NULL
`

const QUERY_OTP = `
SELECT count(if((timediff(lnk.arrivedAt, sch.scheduledArrival)) BETWEEN -150 AND 300, 1, NULL)) / count(1) AS metric
  FROM TripLinks lnk
  JOIN Trips trp
    ON lnk.tripId = trp.tripId
   AND dayId BETWEEN :from AND :to
   AND lnk.linkId = "a3b2ae16-627f-4419-954e-ea8074c18f29"
  JOIN TripLinkSchedule sch
    ON sch.tripId = lnk.tripId
   AND sch.linkId = lnk.linkId
`

const QUERY_HEADWAY_STD_BY_ROUTE = `
SELECT trp.routeId AS route, STD(abs(lnk.headway)) AS metric
  FROM TripLinks lnk
  JOIN Trips trp
    ON lnk.tripId = trp.tripId
 WHERE dayId BETWEEN :from AND :to
   AND lnk.headway IS NOT NULL
 GROUP BY trp.routeId
`
const QUERY_AWT_BY_ROUTE = `
SELECT trp.routeId AS route, SUM(headway * headway) / (2 * SUM(abs(headway)) * 60) AS metric
  FROM TripLinks lnk
  JOIN Trips trp
    ON lnk.tripId = trp.tripId
 WHERE dayId BETWEEN :from AND :to
   AND lnk.headway IS NOT NULL
 GROUP BY trp.routeId   
`

const QUERY_OTP_BY_ROUTE = `
SELECT trp.routeId AS route, count(if((timediff(lnk.arrivedAt, sch.scheduledArrival)) BETWEEN -150 AND 300, 1, NULL)) / count(1) AS metric
  FROM TripLinks lnk
  JOIN Trips trp
    ON lnk.tripId = trp.tripId
   AND dayId BETWEEN :from AND :to
   AND lnk.linkId = "a3b2ae16-627f-4419-954e-ea8074c18f29"
  JOIN TripLinkSchedule sch
    ON sch.tripId = lnk.tripId
   AND sch.linkId = lnk.linkId
 GROUP BY trp.routeId   
`

const QUERY_OTP_BY_DRIVER = `
SELECT trp.routeId AS route, trp.driver, count(if((timediff(lnk.arrivedAt, sch.scheduledArrival)) BETWEEN -150 AND 300, 1, NULL)) / count(1) AS metric
  FROM TripLinks lnk
  JOIN Trips trp
    ON lnk.tripId = trp.tripId
   AND dayId BETWEEN :from AND :to
   AND lnk.linkId = "a3b2ae16-627f-4419-954e-ea8074c18f29"
  JOIN TripLinkSchedule sch
    ON sch.tripId = lnk.tripId
   AND sch.linkId = lnk.linkId
 GROUP BY trp.routeId, trp.driver
`

const QUERY_HEADWAY_STD_FOR_ROUTE = `
SELECT STD(abs(lnk.headway)) AS metric
  FROM TripLinks lnk
  JOIN Trips trp
    ON lnk.tripId = trp.tripId
   AND routeId = :route
   AND dayId BETWEEN :from AND :to
   AND lnk.headway IS NOT NULL
`
const QUERY_AWT_FOR_ROUTE = `
SELECT SUM(headway * headway) / (2 * SUM(abs(headway)) * 60) AS metric
  FROM TripLinks lnk
  JOIN Trips trp
    ON lnk.tripId = trp.tripId
   AND routeId = :route
   AND dayId BETWEEN :from AND :to
   AND lnk.headway IS NOT NULL
`

const QUERY_OTP_FOR_ROUTE = `
SELECT count(if((timediff(lnk.arrivedAt, sch.scheduledArrival)) BETWEEN -150 AND 300, 1, NULL)) / count(1) AS metric
  FROM TripLinks lnk
  JOIN Trips trp
    ON lnk.tripId = trp.tripId
   AND routeId = :route
   AND dayId BETWEEN :from AND :to
   AND lnk.linkId = "a3b2ae16-627f-4419-954e-ea8074c18f29"
  JOIN TripLinkSchedule sch
    ON sch.tripId = lnk.tripId
   AND sch.linkId = lnk.linkId
`

function calculateHA(metric: number | string) {
  const headwayStdDev = typeof metric === "number" ? metric : parseFloat(metric)
  const meanExpectedHeadway = 15 * 60 // 15 mins
  return headwayStdDev / meanExpectedHeadway
}

function calculateEWT(metric: number | string) {
  const awt = typeof metric === "number" ? metric : parseFloat(metric)
  const swt = 7.5 // 15 * 15 / (2 * 15)
  return awt - swt
}

function calculateOTP(metric: number | string) {
  const otp = typeof metric === "number" ? metric : parseFloat(metric)
  return otp * 100 // percentage
}

function getPeriodBounds(period: string) {
  const year = parseInt(period.substring(0, 4))
  return period.endsWith("S1")
    ? [year * 10000 + 101, year * 10000 + 630] // 1-Jan to 30-Jun
    : [year * 10000 + 701, year * 10000 + 1231] // 1-Jul to 31-Dec
}

export default class AnalyticsDAOImpl implements AnalyticsDAO {
  constructor(private sequelize: Sequelize) {}

  async calculateHAforMonth(monthId: number) {
    return this.calculateHAforDuration(monthId * 100 + 1, monthId * 100 + 31)
  }

  async calculateHAforPeriod(period: string) {
    const [fromDayId, toDayId] = getPeriodBounds(period)
    return this.calculateHAforDuration(fromDayId, toDayId)
  }

  async calculateEWTforMonth(monthId: number) {
    return this.calculateEWTforDuration(monthId * 100 + 1, monthId * 100 + 31)
  }

  async calculateEWTforPeriod(period: string) {
    const [fromDayId, toDayId] = getPeriodBounds(period)
    return this.calculateEWTforDuration(fromDayId, toDayId)
  }

  async calculateOTPforMonth(monthId: number) {
    return this.calculateOTPforDuration(monthId * 100 + 1, monthId * 100 + 31)
  }

  async calculateOTPforPeriod(period: string) {
    const [fromDayId, toDayId] = getPeriodBounds(period)
    return this.calculateOTPforDuration(fromDayId, toDayId)
  }

  async calculateHAbyRouteForMonth(monthId: number) {
    return this.calculateHAbyRouteForDuration(
      monthId * 100 + 1,
      monthId * 100 + 31
    )
  }

  async calculateHAbyRouteForPeriod(period: string) {
    const [fromDayId, toDayId] = getPeriodBounds(period)
    return this.calculateHAbyRouteForDuration(fromDayId, toDayId)
  }

  async calculateEWTbyRouteForMonth(monthId: number) {
    return this.calculateEWTbyRouteForDuration(
      monthId * 100 + 1,
      monthId * 100 + 31
    )
  }

  async calculateEWTbyRouteForPeriod(period: string) {
    const [fromDayId, toDayId] = getPeriodBounds(period)
    return this.calculateEWTbyRouteForDuration(fromDayId, toDayId)
  }

  async calculateOTPbyRouteForMonth(monthId: number) {
    return this.calculateOTPbyRouteForDuration(
      monthId * 100 + 1,
      monthId * 100 + 31
    )
  }

  async calculateOTPbyRouteForPeriod(period: string) {
    const [fromDayId, toDayId] = getPeriodBounds(period)
    return this.calculateOTPbyRouteForDuration(fromDayId, toDayId)
  }

  async calculateOTPbyDriverForMonth(monthId: number) {
    return this.calculateOTPbyDriverForDuration(
      monthId * 100 + 1,
      monthId * 100 + 31
    )
  }

  async calculateHAforRouteForMonth(routeId: string, monthId: number) {
    return this.calculateHAforRouteForDuration(
      routeId,
      monthId * 100 + 1,
      monthId * 100 + 31
    )
  }

  async calculateEWTforRouteForMonth(routeId: string, monthId: number) {
    return this.calculateEWTforRouteForDuration(
      routeId,
      monthId * 100 + 1,
      monthId * 100 + 31
    )
  }

  async calculateOTPforRouteForMonth(routeId: string, monthId: number) {
    return this.calculateOTPforRouteForDuration(
      routeId,
      monthId * 100 + 1,
      monthId * 100 + 31
    )
  }

  /** PRIVATE METHODS */

  private async calculateHAforDuration(fromDayId: number, toDayId: number) {
    const { metric } = await this.sequelize.query(QUERY_HEADWAY_STD, {
      replacements: {
        from: fromDayId,
        to: toDayId,
      },
      type: QueryTypes.SELECT,
      plain: true,
    })

    return metric === null || metric === undefined ? null : calculateHA(metric)
  }

  private async calculateEWTforDuration(fromDayId: number, toDayId: number) {
    const { metric } = await this.sequelize.query(QUERY_AWT, {
      replacements: {
        from: fromDayId,
        to: toDayId,
      },
      type: QueryTypes.SELECT,
      plain: true,
    })

    return metric === null || metric === undefined ? null : calculateEWT(metric)
  }

  private async calculateOTPforDuration(fromDayId: number, toDayId: number) {
    const { metric } = await this.sequelize.query(QUERY_OTP, {
      replacements: {
        from: fromDayId,
        to: toDayId,
      },
      type: QueryTypes.SELECT,
      plain: true,
    })

    return metric === null || metric === undefined ? null : calculateOTP(metric)
  }

  private async calculateHAbyRouteForDuration(
    fromDayId: number,
    toDayId: number
  ) {
    const stdDevByRoute: any[] = await this.sequelize.query(
      QUERY_HEADWAY_STD_BY_ROUTE,
      {
        replacements: {
          from: fromDayId,
          to: toDayId,
        },
        type: QueryTypes.SELECT,
      }
    )

    const result: Record<string, number> = {}
    stdDevByRoute.forEach(
      (r) => (result[r["route"]] = calculateHA(r["metric"]))
    )
    return result
  }

  private async calculateEWTbyRouteForDuration(
    fromDayId: number,
    toDayId: number
  ) {
    const awtByRoute: any[] = await this.sequelize.query(QUERY_AWT_BY_ROUTE, {
      replacements: {
        from: fromDayId,
        to: toDayId,
      },
      type: QueryTypes.SELECT,
    })

    const result: Record<string, number> = {}
    awtByRoute.forEach((r) => (result[r["route"]] = calculateEWT(r["metric"])))
    return result
  }

  private async calculateOTPbyRouteForDuration(
    fromDayId: number,
    toDayId: number
  ) {
    const otpByRoute: any[] = await this.sequelize.query(QUERY_OTP_BY_ROUTE, {
      replacements: {
        from: fromDayId,
        to: toDayId,
      },
      type: QueryTypes.SELECT,
    })

    const result: Record<string, number> = {}
    otpByRoute.forEach((r) => (result[r["route"]] = calculateOTP(r["metric"])))
    return result
  }

  private async calculateOTPbyDriverForDuration(
    fromDayId: number,
    toDayId: number
  ) {
    const otpByDriver: any[] = await this.sequelize.query(QUERY_OTP_BY_DRIVER, {
      replacements: {
        from: fromDayId,
        to: toDayId,
      },
      type: QueryTypes.SELECT,
    })

    const result: Array<{
      route: string
      driver: string
      otp: number
    }> = otpByDriver.map((r) => ({
      route: r["route"],
      driver: r["driver"],
      otp: calculateOTP(r["metric"]),
    }))
    return result
  }

  private async calculateHAforRouteForDuration(
    routeId: string,
    fromDayId: number,
    toDayId: number
  ) {
    const { metric } = await this.sequelize.query(QUERY_HEADWAY_STD_FOR_ROUTE, {
      replacements: {
        route: routeId,
        from: fromDayId,
        to: toDayId,
      },
      type: QueryTypes.SELECT,
      plain: true,
    })

    return metric === null || metric === undefined ? null : calculateHA(metric)
  }

  private async calculateEWTforRouteForDuration(
    routeId: string,
    fromDayId: number,
    toDayId: number
  ) {
    const { metric } = await this.sequelize.query(QUERY_AWT_FOR_ROUTE, {
      replacements: {
        route: routeId,
        from: fromDayId,
        to: toDayId,
      },
      type: QueryTypes.SELECT,
      plain: true,
    })

    return metric === null || metric === undefined ? null : calculateEWT(metric)
  }

  private async calculateOTPforRouteForDuration(
    routeId: string,
    fromDayId: number,
    toDayId: number
  ) {
    const { metric } = await this.sequelize.query(QUERY_OTP_FOR_ROUTE, {
      replacements: {
        route: routeId,
        from: fromDayId,
        to: toDayId,
      },
      type: QueryTypes.SELECT,
      plain: true,
    })

    return metric === null || metric === undefined ? null : calculateOTP(metric)
  }
}
