import { EstTravelTime } from "../../../domain/model"

export default interface EstTravelTimeDAO {
  add(records: EstTravelTime[]): Promise<void>
  forTrip(tripId: string): Promise<EstTravelTime[]>
}
