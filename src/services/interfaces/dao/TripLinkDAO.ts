import { TripLink } from "../../../domain/model"

export default interface TripLinkDAO {
  add(record: TripLink): Promise<void>
}
