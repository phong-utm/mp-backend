export interface TripLinkAttributes {
  tripId: string
  linkId: string
  travelledTime?: number
}

export default class TripLink implements TripLinkAttributes {
  travelledTime?: number

  constructor(readonly tripId: string, readonly linkId: string) {}
}
