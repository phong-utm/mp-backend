import { Coordinates } from "../../domain/model"

export interface TripStartedEvent {
  readonly tripId: string
  readonly info: {
    routeId: string
    scheduledStart: string
    dayId: number
  }
}
export interface LocationUpdatedEvent {
  readonly tripId: string
  readonly location: Coordinates
  readonly time: Date
}

export default interface PubSub {
  publishTripStarted(evt: TripStartedEvent): void
  onTripStarted(handler: (evt: TripStartedEvent) => void): void
  publishLocationUpdated(evt: LocationUpdatedEvent): void
  onLocationUpdated(handler: (evt: LocationUpdatedEvent) => void): void
}
