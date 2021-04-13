import { Sequelize } from "sequelize"

import config from "../../common/config"
import AnalyticsDbContext, {
  FactDAO,
  FactDriverMonthAttributes,
  FactOverallMonthAttributes,
  FactOverallPeriodAttributes,
  FactRouteMonthAttributes,
  FactRoutePeriodAttributes,
} from "../../services/interfaces/dao/AnalyticsDbContext"
import {
  initFactOverallMonthModel,
  FactOverallMonth,
} from "./models/FactOverallMonth"
import {
  FactRouteMonth,
  initFactRouteMonthModel,
} from "./models/FactRouteMonth"
import {
  FactDriverMonth,
  initFactDriverMonthModel,
} from "./models/FactDriverMonth"
import {
  initFactOverallPeriodModel,
  FactOverallPeriod,
} from "./models/FactOverallPeriod"
import {
  FactRoutePeriod,
  initFactRoutePeriodModel,
} from "./models/FactRoutePeriod"

const { host, name: dbName, user, password } = config.analyticsDb

export default class MysqlAnalyticsDbContext implements AnalyticsDbContext {
  private sequelize: Sequelize

  constructor() {
    this.sequelize = new Sequelize(dbName, user, password, {
      host,
      dialect: "mysql",
      logging: false,
    })

    initFactOverallMonthModel(this.sequelize)
    initFactRouteMonthModel(this.sequelize)
    initFactDriverMonthModel(this.sequelize)
    initFactOverallPeriodModel(this.sequelize)
    initFactRoutePeriodModel(this.sequelize)
  }

  async sync() {
    await this.sequelize.sync()
  }

  getFactOverallMonthDAO() {
    return new FactOverallMonthDAO()
  }

  getFactRouteMonthDAO() {
    return new FactRouteMonthDAO()
  }

  getFactDriverMonthDAO() {
    return new FactDriverMonthDAO()
  }

  getFactOverallPeriodDAO() {
    return new FactOverallPeriodDAO()
  }

  getFactRoutePeriodDAO() {
    return new FactRoutePeriodDAO()
  }
}

class FactOverallMonthDAO implements FactDAO<FactOverallMonthAttributes> {
  async upsert(record: FactOverallMonthAttributes) {
    await FactOverallMonth.upsert(record)
  }

  async deleteForPeriod(period: string) {
    await FactOverallMonth.destroy({ where: { period } })
  }
}

class FactRouteMonthDAO implements FactDAO<FactRouteMonthAttributes> {
  async upsert(record: FactRouteMonthAttributes) {
    await FactRouteMonth.upsert(record)
  }

  async deleteForPeriod(period: string) {
    await FactRouteMonth.destroy({ where: { period } })
  }
}

class FactDriverMonthDAO implements FactDAO<FactDriverMonthAttributes> {
  async upsert(record: FactDriverMonthAttributes) {
    await FactDriverMonth.upsert(record)
  }

  async deleteForPeriod(period: string) {
    await FactDriverMonth.destroy({ where: { period } })
  }
}

class FactOverallPeriodDAO implements FactDAO<FactOverallPeriodAttributes> {
  async upsert(record: FactOverallPeriodAttributes) {
    await FactOverallPeriod.upsert(record)
  }

  async deleteForPeriod(period: string) {
    await FactOverallPeriod.destroy({ where: { period } })
  }
}

class FactRoutePeriodDAO implements FactDAO<FactRoutePeriodAttributes> {
  async upsert(record: FactRoutePeriodAttributes) {
    await FactRoutePeriod.upsert(record)
  }

  async deleteForPeriod(period: string) {
    await FactRoutePeriod.destroy({ where: { period } })
  }
}
