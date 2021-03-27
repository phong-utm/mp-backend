import { RouteData, Trip } from "../../../domain/model"

export default interface TripDAO {
  add(record: Trip): Promise<void>
  getRouteForTrip(tripId: string): Promise<RouteData>

  //   find(query: { routeId: string, scheduledStart: string, dayId: number }): Promise<Trip | undefined>
  //   delete(tripId: string): Promise<void>
}
