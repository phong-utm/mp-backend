import AnalyticsDAO from "./AnalyticsDAO"
import RouteDAO from "./RouteDAO"
import TripDAO from "./TripDAO"
import TripLinkDAO from "./TripLinkDAO"
import TripLinkEstimateDAO from "./TripLinkEstimateDAO"
import TripLinkScheduleDAO from "./TripLinkScheduleDAO"

export default interface OperationalDbContext {
  getRouteDAO(): RouteDAO
  getTripDAO(): TripDAO
  getTripLinkDAO(): TripLinkDAO
  getTripLinkEstimateDAO(): TripLinkEstimateDAO
  getTripLinkScheduleDAO(): TripLinkScheduleDAO
  getAnalyticsDAO(): AnalyticsDAO
}
