import { RouteData } from "../../../domain/model"

export default interface RouteDAO {
  findById(id: string): Promise<RouteData | undefined>
}
