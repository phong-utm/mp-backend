import { TripLinkEstimate } from "../../../domain/model"

export default interface TripLinkEstimateDAO {
  add(records: TripLinkEstimate[]): Promise<void>
  forTrip(tripId: string): Promise<TripLinkEstimate[]>
}
