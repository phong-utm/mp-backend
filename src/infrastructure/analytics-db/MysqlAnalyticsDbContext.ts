import { Sequelize } from "sequelize"

import config from "../../common/config"
import AnalyticsDbContext, {
  FactDAO,
  FactOverallMonthAttributes,
} from "../../services/interfaces/dao/AnalyticsDbContext"
import {
  initFactOverallMonthModel,
  FactOverallMonth,
} from "./models/FactOverallMonth"

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
  }

  async sync() {
    await this.sequelize.sync()
  }

  getFactOverallMonthDAO() {
    return new FactMonthDAO()
  }
}

class FactMonthDAO implements FactDAO<FactOverallMonthAttributes> {
  async upsert(record: FactOverallMonthAttributes) {
    await FactOverallMonth.upsert(record)
  }
}
