export default interface AnalyticsDAO {
  calculateHAforMonth(monthId: number): Promise<number | null>
  calculateEWTforMonth(monthId: number): Promise<number | null>
  calculateOTPforMonth(monthId: number): Promise<number | null>

  calculateHAbyRouteForMonth(monthId: number): Promise<Record<string, number>>
  calculateEWTbyRouteForMonth(monthId: number): Promise<Record<string, number>>
  calculateOTPbyRouteForMonth(monthId: number): Promise<Record<string, number>>

  calculateOTPbyDriverForMonth(
    monthId: number
  ): Promise<Array<{ route: string; driver: string; otp: number }>>

  calculateHAforPeriod(period: string): Promise<number | null>
  calculateEWTforPeriod(period: string): Promise<number | null>
  calculateOTPforPeriod(period: string): Promise<number | null>

  calculateHAbyRouteForPeriod(period: string): Promise<Record<string, number>>
  calculateEWTbyRouteForPeriod(period: string): Promise<Record<string, number>>
  calculateOTPbyRouteForPeriod(period: string): Promise<Record<string, number>>

  calculateHAforRouteForMonth(
    routeId: string,
    monthId: number
  ): Promise<number | null>
  calculateEWTforRouteForMonth(
    routeId: string,
    monthId: number
  ): Promise<number | null>
  calculateOTPforRouteForMonth(
    routeId: string,
    monthId: number
  ): Promise<number | null>
}
