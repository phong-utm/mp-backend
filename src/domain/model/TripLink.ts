import TripId from "./TripId"

export default class TripLink {
  travelledTime?: number

  constructor(readonly tripId: TripId, readonly linkId: string) {}
}
