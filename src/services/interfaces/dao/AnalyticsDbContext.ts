export interface FactOverallMonthAttributes {
  period: string
  month: string
  ha: number
  ewt: number
  otp: number
}

export interface FactRouteMonthAttributes {
  period: string
  month: string
  route: string
  ha: number
  ewt: number
  otp: number
}

export interface FactDriverMonthAttributes {
  period: string
  month: string
  route: string
  driver: string
  otp: number
}

export interface FactOverallPeriodAttributes {
  period: string
  ha: number
  ewt: number
  otp: number
}

export interface FactDAO<T> {
  upsert(record: T): Promise<void>
}

export default interface AnalyticsDbContext {
  getFactOverallMonthDAO(): FactDAO<FactOverallMonthAttributes>
  getFactRouteMonthDAO(): FactDAO<FactRouteMonthAttributes>
  getFactDriverMonthDAO(): FactDAO<FactDriverMonthAttributes>

  getFactOverallPeriodDAO(): FactDAO<FactOverallPeriodAttributes>
}
