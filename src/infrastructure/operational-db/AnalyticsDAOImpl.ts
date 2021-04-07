import { Sequelize, QueryTypes } from "sequelize"

import AnalyticsDAO from "../../services/interfaces/dao/AnalyticsDAO"

const QUERY_HEADWAY_STD_MONTH = `
SELECT STD(abs(lnk.headway)) AS metric
  FROM TripLinks lnk
  JOIN Trips trp
    ON lnk.tripId = trp.tripId
 WHERE dayId div 100 = :monthId
   AND lnk.headway IS NOT NULL
`
const QUERY_AWT_MONTH = `
SELECT SUM(headway * headway) / (2 * SUM(abs(headway)) * 60) AS metric
  FROM TripLinks lnk
  JOIN Trips trp
    ON lnk.tripId = trp.tripId
 WHERE dayId div 100 = :monthId
   AND lnk.headway IS NOT NULL
`

const QUERY_OTP_MONTH = `
SELECT count(if((timediff(lnk.arrivedAt, sch.scheduledArrival)) BETWEEN -150 AND 300, 1, NULL)) / count(1) AS metric
  FROM TripLinks lnk
  JOIN Trips trp
    ON lnk.tripId = trp.tripId
   AND dayId div 100 = :monthId
  JOIN TripLinkSchedule sch
    ON sch.tripId = lnk.tripId
   AND sch.linkId = lnk.linkId
`

const QUERY_HEADWAY_STD_BY_ROUTE = `
SELECT trp.routeId AS route, STD(abs(lnk.headway)) AS metric
  FROM TripLinks lnk
  JOIN Trips trp
    ON lnk.tripId = trp.tripId
 WHERE dayId div 100 = :monthId
   AND lnk.headway IS NOT NULL
 GROUP BY trp.routeId
`
const QUERY_AWT_BY_ROUTE = `
SELECT trp.routeId AS route, SUM(headway * headway) / (2 * SUM(abs(headway)) * 60) AS metric
  FROM TripLinks lnk
  JOIN Trips trp
    ON lnk.tripId = trp.tripId
 WHERE dayId div 100 = :monthId
   AND lnk.headway IS NOT NULL
 GROUP BY trp.routeId   
`

const QUERY_OTP_BY_ROUTE = `
SELECT trp.routeId AS route, count(if((timediff(lnk.arrivedAt, sch.scheduledArrival)) BETWEEN -150 AND 300, 1, NULL)) / count(1) AS metric
  FROM TripLinks lnk
  JOIN Trips trp
    ON lnk.tripId = trp.tripId
   AND dayId div 100 = :monthId
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
   AND dayId div 100 = :monthId
  JOIN TripLinkSchedule sch
    ON sch.tripId = lnk.tripId
   AND sch.linkId = lnk.linkId
 GROUP BY trp.routeId, trp.driver
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

export default class AnalyticsDAOImpl implements AnalyticsDAO {
  constructor(private sequelize: Sequelize) {}

  async calculateHAforMonth(monthId: number) {
    const { metric } = await this.sequelize.query(QUERY_HEADWAY_STD_MONTH, {
      replacements: {
        monthId,
      },
      type: QueryTypes.SELECT,
      plain: true,
    })

    return calculateHA(metric)
  }

  async calculateEWTforMonth(monthId: number) {
    const { metric } = await this.sequelize.query(QUERY_AWT_MONTH, {
      replacements: {
        monthId,
      },
      type: QueryTypes.SELECT,
      plain: true,
    })

    return calculateEWT(metric)
  }

  async calculateOTPforMonth(monthId: number) {
    const { metric } = await this.sequelize.query(QUERY_OTP_MONTH, {
      replacements: {
        monthId,
      },
      type: QueryTypes.SELECT,
      plain: true,
    })

    return calculateOTP(metric)
  }

  async calculateHAbyRouteForMonth(monthId: number) {
    const stdDevByRoute: any[] = await this.sequelize.query(
      QUERY_HEADWAY_STD_BY_ROUTE,
      {
        replacements: {
          monthId,
        },
        type: QueryTypes.SELECT,
        // plain: true,
      }
    )

    const result: Record<string, number> = {}
    stdDevByRoute.forEach(
      (r) => (result[r["route"]] = calculateHA(r["metric"]))
    )
    return result
  }

  async calculateEWTbyRouteForMonth(monthId: number) {
    const awtByRoute: any[] = await this.sequelize.query(QUERY_AWT_BY_ROUTE, {
      replacements: {
        monthId,
      },
      type: QueryTypes.SELECT,
      // plain: true,
    })

    const result: Record<string, number> = {}
    awtByRoute.forEach((r) => (result[r["route"]] = calculateEWT(r["metric"])))
    return result
  }

  async calculateOTPbyRouteForMonth(monthId: number) {
    const otpByRoute: any[] = await this.sequelize.query(QUERY_OTP_BY_ROUTE, {
      replacements: {
        monthId,
      },
      type: QueryTypes.SELECT,
      // plain: true,
    })

    const result: Record<string, number> = {}
    otpByRoute.forEach((r) => (result[r["route"]] = calculateOTP(r["metric"])))
    return result
  }

  async calculateOTPbyDriverForMonth(monthId: number) {
    const otpByDriver: any[] = await this.sequelize.query(QUERY_OTP_BY_DRIVER, {
      replacements: {
        monthId,
      },
      type: QueryTypes.SELECT,
      // plain: true,
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
}
