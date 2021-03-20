import { Sequelize } from "sequelize"

import config from "../../common/config"
import OperationalDbContext from "../../services/interfaces/dao/OperationalDbContext"
import RouteDAO from "../../services/interfaces/dao/RouteDAO"
import TripLinkDAO from "../../services/interfaces/dao/TripLinkDAO"
import RouteDAOImpl from "./RouteDAOImpl"
import TripLinkDAOImpl from "./TripLinkDAOImpl"
import { defineTripLinkModel, TripLinkSequelizeModel } from "./models/TripLink"

const { host, name: dbName, user, password } = config.operationalDb

export default class MysqlOperationalDbContext implements OperationalDbContext {
  private sequelize: Sequelize
  private TripLinkModel: TripLinkSequelizeModel

  constructor() {
    this.sequelize = new Sequelize(dbName, user, password, {
      host,
      dialect: "mysql",
    })
    this.TripLinkModel = defineTripLinkModel(this.sequelize)
  }

  async sync() {
    await this.sequelize.sync()
  }

  getRouteDAO(): RouteDAO {
    return new RouteDAOImpl()
  }

  getTripLinkDAO(): TripLinkDAO {
    return new TripLinkDAOImpl(this.TripLinkModel)
  }
}
