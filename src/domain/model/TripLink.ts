export default interface TripLink {
  tripId: string
  linkId: string
  travelledTime: number
  arrivedAt: Date
  headway: number | null
}
