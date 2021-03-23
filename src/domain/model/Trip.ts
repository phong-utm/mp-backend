export interface TripAttributes {
  tripId: string
  routeId: string
  scheduledStart: string // 09:30
  dayId: number // yyyyMMdd
}

export default class Trip implements TripAttributes {
  constructor(
    readonly tripId: string,
    readonly routeId: string,
    readonly scheduledStart: string,
    readonly dayId: number
  ) {}
}
