import RouteRepository from "../domain/interfaces/RouteRepository"
import busRoutes from "./data/routes.json"

export default class FilesystemRouteRepository implements RouteRepository {
  async findById(id: string) {
    // @ts-ignore
    return Promise.resolve(busRoutes[id])
  }
}
