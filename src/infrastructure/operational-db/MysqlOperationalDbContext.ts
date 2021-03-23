import { Sequelize } from "sequelize"

import config from "../../common/config"
import OperationalDbContext from "../../services/interfaces/dao/OperationalDbContext"
import RouteDAO from "../../services/interfaces/dao/RouteDAO"
import TripDAO from "../../services/interfaces/dao/TripDAO"
import TripLinkDAO from "../../services/interfaces/dao/TripLinkDAO"
import RouteDAOImpl from "./RouteDAOImpl"
import TripDAOImpl from "./TripDAOImpl"
import TripLinkDAOImpl from "./TripLinkDAOImpl"
import { TripDbModel, defineTripModel } from "./models/TripDbModel"
import { defineTripLinkModel, TripLinkDbModel } from "./models/TripLinkDbModel"

const { host, name: dbName, user, password } = config.operationalDb

export default class MysqlOperationalDbContext implements OperationalDbContext {
  private sequelize: Sequelize
  private tripModel: TripDbModel
  private tripLinkModel: TripLinkDbModel

  constructor() {
    this.sequelize = new Sequelize(dbName, user, password, {
      host,
      dialect: "mysql",
    })
    this.tripModel = defineTripModel(this.sequelize)
    this.tripLinkModel = defineTripLinkModel(this.sequelize)
  }

  async sync() {
    await this.sequelize.sync()
  }

  getRouteDAO(): RouteDAO {
    return new RouteDAOImpl()
  }

  getTripDAO(): TripDAO {
    return new TripDAOImpl(this.tripModel)
  }

  getTripLinkDAO(): TripLinkDAO {
    return new TripLinkDAOImpl(this.tripLinkModel)
  }
}
