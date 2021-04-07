import AnalyticsDAO from "./interfaces/dao/AnalyticsDAO"
import AnalyticsDbContext from "./interfaces/dao/AnalyticsDbContext"
import OperationalDbContext from "./interfaces/dao/OperationalDbContext"

// prettier-ignore
const MONTH_NAMES = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]

export default class ServiceAnalyzer {
  private analyticsDao: AnalyticsDAO

  constructor(
    operationalDb: OperationalDbContext,
    private analyticsDb: AnalyticsDbContext
  ) {
    this.analyticsDao = operationalDb.getAnalyticsDAO()
  }

  async processMonth(monthId: number) {
    const year = Math.floor(monthId / 100)
    const month = monthId % 100
    const monthName = MONTH_NAMES[month - 1]
    const period = `${year}-S${Math.ceil(month / 6)}`

    const [ha, ewt, otp] = await Promise.all([
      this.analyticsDao.calculateHAforMonth(monthId),
      this.analyticsDao.calculateEWTforMonth(monthId),
      this.analyticsDao.calculateOTPforMonth(monthId),
    ])

    const overallResult = {
      period,
      month: monthName,
      ha,
      ewt,
      otp,
    }

    await this.analyticsDb.getFactOverallMonthDAO().upsert(overallResult)

    const [haByRoute, ewtByRoute, otpByRoute] = await Promise.all([
      this.analyticsDao.calculateHAbyRouteForMonth(monthId),
      this.analyticsDao.calculateEWTbyRouteForMonth(monthId),
      this.analyticsDao.calculateOTPbyRouteForMonth(monthId),
    ])

    const byRouteResult = Object.keys(haByRoute).map((route) => ({
      period,
      month: monthName,
      route,
      ha: haByRoute[route],
      ewt: ewtByRoute[route],
      otp: otpByRoute[route],
    }))

    await Promise.all(
      byRouteResult.map((record) =>
        this.analyticsDb.getFactRouteMonthDAO().upsert(record)
      )
    )

    //   const haByDriver = await this.analyticsDao.calculateHAbyDriverForMonth(month)
    // const ewtByDriver = await this.analyticsDao.calculateEWTbyDriverForMonth(month)
    // const otpByDriver = await this.analyticsDao.calculateOTPbyDriverForMonth(month)

    return {
      overall: overallResult,
      byRoute: byRouteResult,
    }
  }

  async processPeriod(period: string) {}

  async processAfterTrip(month: number, routeId: string, driver: string) {}
}
