import { RouteData } from "../model"

export default interface RouteRepository {
  findById(id: string): Promise<RouteData | undefined>
}
