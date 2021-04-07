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

    const headwayStdDev =
      typeof metric === "number" ? metric : parseFloat(metric)
    const meanExpectedHeadway = 15 * 60 // 15 mins
    return headwayStdDev / meanExpectedHeadway
  }

  async calculateEWTforMonth(monthId: number) {
    const { metric } = await this.sequelize.query(QUERY_AWT_MONTH, {
      replacements: {
        monthId,
      },
      type: QueryTypes.SELECT,
      plain: true,
    })
    const awt = typeof metric === "number" ? metric : parseFloat(metric)
    const swt = 7.5 // 15 * 15 / (2 * 15)
    return awt - swt
  }

  async calculateOTPforMonth(monthId: number) {
    const { metric } = await this.sequelize.query(QUERY_OTP_MONTH, {
      replacements: {
        monthId,
      },
      type: QueryTypes.SELECT,
      plain: true,
    })
    const otp = typeof metric === "number" ? metric : parseFloat(metric)
    return otp * 100 // percentage
  }
}
