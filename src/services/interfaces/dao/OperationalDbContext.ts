import EstTravelTimeDAO from "./EstTravelTimeDAO"
import RouteDAO from "./RouteDAO"
import TripDAO from "./TripDAO"
import TripLinkDAO from "./TripLinkDAO"

export default interface OperationalDbContext {
  getRouteDAO(): RouteDAO
  getTripDAO(): TripDAO
  getTripLinkDAO(): TripLinkDAO
  getEstTravelTimeDAO(): EstTravelTimeDAO
}
