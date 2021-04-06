import RouteDAO from "../../services/interfaces/dao/RouteDAO"
import busRoutes from "./data/routes.json"

export default class RouteDAOImpl implements RouteDAO {
  async findById(id: string) {
    // @ts-ignore
    return Promise.resolve(busRoutes["T100"])
  }
}
