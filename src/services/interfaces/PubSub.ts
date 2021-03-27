import { Coordinates } from "../../domain/model"

export interface LocationUpdatedEvent {
  readonly tripId: string
  readonly location: Coordinates
  readonly time: Date
}

export interface MidLinkEvent {
  readonly tripId: string
  readonly linkId: string
  readonly linkTravelledTime: number
  readonly linkRemainingDistance: number
  readonly timestamp: number
}

export interface TripStartedEvent {
  readonly tripId: string
  readonly info: {
    routeId: string
    scheduledStart: string
    dayId: number
  }
}

export interface TripEndedEvent {
  readonly tripId: string
}

export default interface PubSub {
  publishTripStarted(evt: TripStartedEvent): void
  publishLocationUpdated(evt: LocationUpdatedEvent): void
  publishMidLink(evt: MidLinkEvent): void
  publishTripEnded(evt: TripEndedEvent): void

  onTripStarted(handler: (evt: TripStartedEvent) => void): void
  onLocationUpdated(handler: (evt: LocationUpdatedEvent) => void): void
  onMidLink(handler: (evt: MidLinkEvent) => void): void
  onTripEnded(handler: (evt: TripEndedEvent) => void): void
}
