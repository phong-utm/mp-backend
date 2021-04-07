export interface FactOverallMonthAttributes {
  period: string
  month: string
  ha: number
  ewt: number
  otp: number
}

export interface FactDAO<T> {
  upsert(record: T): Promise<void>
}

export default interface AnalyticsDbContext {
  getFactOverallMonthDAO(): FactDAO<FactOverallMonthAttributes>
}
