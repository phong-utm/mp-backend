import RouteDAO from "./RouteDAO"
import TripLinkDAO from "./TripLinkDAO"

export default interface OperationalDAOFactory {
  getRouteDAO(): RouteDAO
  getTripLinkDAO(): TripLinkDAO
}
