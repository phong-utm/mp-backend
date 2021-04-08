import AnalyticsDAO from "./interfaces/dao/AnalyticsDAO"
import AnalyticsDbContext from "./interfaces/dao/AnalyticsDbContext"
import OperationalDbContext from "./interfaces/dao/OperationalDbContext"
import TripDAO from "./interfaces/dao/TripDAO"

// prettier-ignore
const MONTH_NAMES = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]

const parseMonthId = (monthId: number) => {
  const year = Math.floor(monthId / 100)
  const month = monthId % 100
  const monthName = MONTH_NAMES[month - 1]
  const period = `${year}-S${Math.ceil(month / 6)}`
  return [monthName, period]
}

const parseDayId = (dayId: number) => {
  const monthId = Math.floor(dayId / 100)
  const [monthName, period] = parseMonthId(monthId)
  return [monthId, monthName, period] as [number, string, string]
}

export default class ServiceAnalyzer {
  private analyticsDao: AnalyticsDAO
  private tripDao: TripDAO

  constructor(
    operationalDb: OperationalDbContext,
    private analyticsDb: AnalyticsDbContext
  ) {
    this.analyticsDao = operationalDb.getAnalyticsDAO()
    this.tripDao = operationalDb.getTripDAO()
  }

  async processMonth(monthId: number) {
    const [monthName, period] = parseMonthId(monthId)

    // overall analytics for the month
    const [ha, ewt, otp] = await Promise.all([
      this.analyticsDao.calculateHAforMonth(monthId),
      this.analyticsDao.calculateEWTforMonth(monthId),
      this.analyticsDao.calculateOTPforMonth(monthId),
    ])

    const overallResult = {
      period,
      month: monthName,
      ha: ha === null ? 0 : ha,
      ewt: ewt === null ? 0 : ewt,
      otp: otp === null ? 100 : otp,
    }

    // analytics by route
    const [haByRoute, ewtByRoute, otpByRoute] = await Promise.all([
      this.analyticsDao.calculateHAbyRouteForMonth(monthId),
      this.analyticsDao.calculateEWTbyRouteForMonth(monthId),
      this.analyticsDao.calculateOTPbyRouteForMonth(monthId),
    ])

    const byRouteResult = Object.keys(otpByRoute).map((route) => ({
      period,
      month: monthName,
      route,
      ha: haByRoute[route],
      ewt: ewtByRoute[route],
      otp: otpByRoute[route],
    }))

    // analytics by driver
    const otpByDriver = await this.analyticsDao.calculateOTPbyDriverForMonth(
      monthId
    )

    const byDriverResult = otpByDriver.map(({ route, driver, otp }) => ({
      period,
      month: monthName,
      route,
      driver,
      otp,
    }))

    // save analytics results into the database
    await this.analyticsDb.getFactOverallMonthDAO().upsert(overallResult)

    await Promise.all(
      byRouteResult.map((record) =>
        this.analyticsDb.getFactRouteMonthDAO().upsert(record)
      )
    )

    await Promise.all(
      byDriverResult.map((record) =>
        this.analyticsDb.getFactDriverMonthDAO().upsert(record)
      )
    )

    return {
      overall: overallResult,
      byRoute: byRouteResult,
      byDriver: byDriverResult,
    }
  }

  async processPeriod(period: string) {
    // overall analytics for the month
    const [ha, ewt, otp] = await Promise.all([
      this.analyticsDao.calculateHAforPeriod(period),
      this.analyticsDao.calculateEWTforPeriod(period),
      this.analyticsDao.calculateOTPforPeriod(period),
    ])

    const overallResult = {
      period,
      ha: ha === null ? 0 : ha,
      ewt: ewt === null ? 0 : ewt,
      otp: otp === null ? 100 : otp,
    }

    // analytics by route
    const [haByRoute, ewtByRoute, otpByRoute] = await Promise.all([
      this.analyticsDao.calculateHAbyRouteForPeriod(period),
      this.analyticsDao.calculateEWTbyRouteForPeriod(period),
      this.analyticsDao.calculateOTPbyRouteForPeriod(period),
    ])

    const byRouteResult = Object.keys(otpByRoute).map((route) => ({
      period,
      route,
      ha: haByRoute[route],
      ewt: ewtByRoute[route],
      otp: otpByRoute[route],
    }))

    // save analytics results into the database
    await this.analyticsDb.getFactOverallPeriodDAO().upsert(overallResult)

    await Promise.all(
      byRouteResult.map((record) =>
        this.analyticsDb.getFactRoutePeriodDAO().upsert(record)
      )
    )

    return {
      overall: overallResult,
      byRoute: byRouteResult,
    }
  }

  async processAfterTrip(tripId: string) {
    const trip = await this.tripDao.findById(tripId)
    const { routeId, dayId } = trip!
    const [monthId, monthName, period] = parseDayId(dayId)

    const [ha, ewt, otp] = await Promise.all([
      this.analyticsDao.calculateHAforRouteForMonth(routeId, monthId),
      this.analyticsDao.calculateEWTforRouteForMonth(routeId, monthId),
      this.analyticsDao.calculateOTPforRouteForMonth(routeId, monthId),
    ])

    const result = {
      period,
      month: monthName,
      route: routeId,
      ha: ha === null ? 0 : ha,
      ewt: ewt === null ? 0 : ewt,
      otp: otp === null ? 100 : otp,
    }

    await this.analyticsDb.getFactRouteMonthDAO().upsert(result)
  }
}
