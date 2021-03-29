import { TripLinkSchedule } from "../../../domain/model"

export default interface TripLinkScheduleDAO {
  add(records: TripLinkSchedule[]): Promise<void>
  // forTrip(tripId: string): Promise<TripLinkSchedule[]>
}
