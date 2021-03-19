import { TripId, Coordinates } from "../../domain/model"

export class LocationUpdatedEvent {
  constructor(
    readonly tripId: TripId,
    readonly location: Coordinates,
    readonly time: Date
  ) {}
}

export default interface PubSub {
  publishLocationUpdated(evt: LocationUpdatedEvent): void
  onLocationUpdated(handler: (evt: LocationUpdatedEvent) => void): void
}
