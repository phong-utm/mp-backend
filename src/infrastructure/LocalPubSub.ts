import { EventEmitter } from "ws"
import PubSub, { LocationUpdatedEvent } from "../services/interfaces/PubSub"

const EVENT_LOCATION_UPDATED = Symbol()

export default class LocalPubSub implements PubSub {
  private emitter = new EventEmitter()

  publishLocationUpdated(evt: LocationUpdatedEvent): void {
    this.emitter.emit(EVENT_LOCATION_UPDATED, evt)
  }

  onLocationUpdated(handler: (evt: LocationUpdatedEvent) => void): void {
    this.emitter.on(EVENT_LOCATION_UPDATED, handler)
  }
}
