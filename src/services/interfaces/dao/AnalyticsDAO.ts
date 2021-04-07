export default interface AnalyticsDAO {
  calculateHAforMonth(month: number): Promise<number>
  calculateEWTforMonth(month: number): Promise<number>
  calculateOTPforMonth(month: number): Promise<number>
}
