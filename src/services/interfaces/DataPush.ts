import { BusLocation, ETA, TripId } from "../../domain/model"

export default interface DataPush {
  pushLocation(tripId: TripId, location: BusLocation): void
  pushETAs(tripId: TripId, arrival: ETA[]): void
}
