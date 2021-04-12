import { Trip } from "../../../domain/model"

export default interface TripDAO {
  add(record: Trip): Promise<void>
  findById(id: string): Promise<Trip | undefined>
  delete(tripId: string): Promise<boolean>
  deleteForMonth(monthId: number): Promise<void>
  deleteForPeriod(period: string): Promise<void>

  //   find(query: { routeId: string, scheduledStart: string, dayId: number }): Promise<Trip | undefined>
  //   delete(tripId: string): Promise<void>
}
