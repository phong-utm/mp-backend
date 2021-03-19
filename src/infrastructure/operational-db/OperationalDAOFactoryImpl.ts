import OperationalDAOFactory from "../../services/interfaces/dao/OperationalDAOFactory"
import RouteDAO from "../../services/interfaces/dao/RouteDAO"
import TripLinkDAO from "../../services/interfaces/dao/TripLinkDAO"
import RouteDAOImpl from "./RouteDAOImpl"
import TripLinkDAOImpl from "./TripLinkDAOImpl"

export default class OperationalDAOFactoryImpl
  implements OperationalDAOFactory {
  getRouteDAO(): RouteDAO {
    return new RouteDAOImpl()
  }

  getTripLinkDAO(): TripLinkDAO {
    return new TripLinkDAOImpl()
  }
}
