import { TripLink } from "../../../domain/model"

export default interface TripLinkDAO {
  add(record: TripLink): Promise<void>

  forHistoricalTrips(
    routeId: string,
    scheduledStart: string,
    dayId: number
  ): Promise<TripLink[]>

  forPrevTripSameDay(
    routeId: string,
    scheduledStart: string,
    dayId: number
  ): Promise<TripLink[]>
}
