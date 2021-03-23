import { Coordinates, ETA } from "../../domain/model"

export default interface DataPush {
  pushLocation(tripId: string, location: Coordinates): void
  pushETAs(tripId: string, arrival: ETA[]): void
}
