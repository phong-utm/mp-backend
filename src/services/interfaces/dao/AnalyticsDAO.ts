export default interface AnalyticsDAO {
  calculateHAforMonth(monthId: number): Promise<number>
  calculateEWTforMonth(monthId: number): Promise<number>
  calculateOTPforMonth(monthId: number): Promise<number>

  calculateHAbyRouteForMonth(monthId: number): Promise<Record<string, number>>
  calculateEWTbyRouteForMonth(monthId: number): Promise<Record<string, number>>
  calculateOTPbyRouteForMonth(monthId: number): Promise<Record<string, number>>

  calculateOTPbyDriverForMonth(
    monthId: number
  ): Promise<Array<{ route: string; driver: string; otp: number }>>

  calculateHAforPeriod(period: string): Promise<number>
  calculateEWTforPeriod(period: string): Promise<number>
  calculateOTPforPeriod(period: string): Promise<number>

  calculateHAbyRouteForPeriod(period: string): Promise<Record<string, number>>
  calculateEWTbyRouteForPeriod(period: string): Promise<Record<string, number>>
  calculateOTPbyRouteForPeriod(period: string): Promise<Record<string, number>>
}
