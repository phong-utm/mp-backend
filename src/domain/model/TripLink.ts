export default class TripLink {
  travelledTime?: number

  constructor(readonly tripId: string, readonly linkId: string) {}
}
