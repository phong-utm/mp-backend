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

    const result = {
      period,
      month: monthName,
      ha,
      ewt,
      otp,
    }

    await this.analyticsDb.getFactOverallMonthDAO().upsert(result)

    return result

    //   const haByRoute = await this.analyticsDao.calculateHAbyRouteForMonth(month)
    // const ewtByRoute = await this.analyticsDao.calculateEWTbyRouteForMonth(month)
    // const otpByRoute = await this.analyticsDao.calculateOTPbyRouteForMonth(month)

    //   const haByDriver = await this.analyticsDao.calculateHAbyDriverForMonth(month)
    // const ewtByDriver = await this.analyticsDao.calculateEWTbyDriverForMonth(month)
    // const otpByDriver = await this.analyticsDao.calculateOTPbyDriverForMonth(month)
  }

  async processPeriod(period: string) {}

  async processAfterTrip(month: number, routeId: string, driver: string) {}
}
