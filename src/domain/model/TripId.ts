export default class TripId {
  static tripRegistry = new Map<string, TripId>()
  static getInstance(routeId: string, tripId: string) {
    const key = `${routeId}##${tripId}`
    if (!this.tripRegistry.has(key)) {
      this.tripRegistry.set(key, new TripId(routeId, tripId))
    }
    return this.tripRegistry.get(key)!
  }

  private constructor(readonly routeId: string, readonly tripId: string) {}
}
