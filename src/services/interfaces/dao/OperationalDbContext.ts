import RouteDAO from "./RouteDAO"
import TripLinkDAO from "./TripLinkDAO"

export default interface OperationalDbContext {
  getRouteDAO(): RouteDAO
  getTripLinkDAO(): TripLinkDAO
}
