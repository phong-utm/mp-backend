export default interface AnalyticsDAO {
  calculateHAforMonth(monthId: number): Promise<number>
  calculateEWTforMonth(monthId: number): Promise<number>
  calculateOTPforMonth(monthId: number): Promise<number>

  calculateHAbyRouteForMonth(monthId: number): Promise<Record<string, number>>
  calculateEWTbyRouteForMonth(monthId: number): Promise<Record<string, number>>
  calculateOTPbyRouteForMonth(monthId: number): Promise<Record<string, number>>
}
