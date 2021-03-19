export class TripId {
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

export class ETA {
  constructor(readonly stop: string, readonly minutes: number) {}
}

export interface Coordinates {
  lat: number
  lng: number
}

type LinkPointData = Coordinates & {
  distFromPrev: number
}

export interface LinkData {
  id: string
  from: string
  to: string
  points: LinkPointData[]
  length: number
  baseDuration: number
}

export interface RouteData {
  origin: string
  destination: string
  links: LinkData[]
}

export class TripLink {
  travelledTime?: number
  estimatedTime?: number

  constructor(readonly tripId: TripId, readonly linkId: string) {}
}
