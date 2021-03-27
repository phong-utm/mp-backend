import { EventEmitter } from "ws"
import PubSub, {
  LocationUpdatedEvent,
  MidLinkEvent,
  TripEndedEvent,
  TripStartedEvent,
} from "../services/interfaces/PubSub"

const EVENT_TRIP_STARTED = Symbol()
const EVENT_TRIP_ENDED = Symbol()
const EVENT_LOCATION_UPDATED = Symbol()
const EVENT_MID_LINK = Symbol()

export default class LocalPubSub implements PubSub {
  private emitter = new EventEmitter()

  publishTripStarted(evt: TripStartedEvent) {
    this.emitter.emit(EVENT_TRIP_STARTED, evt)
  }

  onTripStarted(handler: (evt: TripStartedEvent) => void) {
    this.emitter.on(EVENT_TRIP_STARTED, handler)
  }

  publishLocationUpdated(evt: LocationUpdatedEvent) {
    this.emitter.emit(EVENT_LOCATION_UPDATED, evt)
  }

  onLocationUpdated(handler: (evt: LocationUpdatedEvent) => void) {
    this.emitter.on(EVENT_LOCATION_UPDATED, handler)
  }

  publishMidLink(evt: MidLinkEvent) {
    this.emitter.emit(EVENT_MID_LINK, evt)
  }

  onMidLink(handler: (evt: MidLinkEvent) => void) {
    this.emitter.on(EVENT_MID_LINK, handler)
  }

  publishTripEnded(evt: TripEndedEvent) {
    this.emitter.emit(EVENT_TRIP_ENDED, evt)
  }

  onTripEnded(handler: (evt: TripEndedEvent) => void): void {
    this.emitter.on(EVENT_TRIP_ENDED, handler)
  }
}
