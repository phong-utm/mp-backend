import { Sequelize } from "sequelize"

import config from "../../common/config"
import AnalyticsDbContext, {
  FactDAO,
  FactDriverMonthAttributes,
  FactOverallMonthAttributes,
  FactRouteMonthAttributes,
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
}

class FactOverallMonthDAO implements FactDAO<FactOverallMonthAttributes> {
  async upsert(record: FactOverallMonthAttributes) {
    await FactOverallMonth.upsert(record)
  }
}

class FactRouteMonthDAO implements FactDAO<FactRouteMonthAttributes> {
  async upsert(record: FactRouteMonthAttributes) {
    await FactRouteMonth.upsert(record)
  }
}

class FactDriverMonthDAO implements FactDAO<FactDriverMonthAttributes> {
  async upsert(record: FactDriverMonthAttributes) {
    await FactDriverMonth.upsert(record)
  }
}
