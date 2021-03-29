import { Sequelize } from "sequelize"

import config from "../../common/config"
import OperationalDbContext from "../../services/interfaces/dao/OperationalDbContext"
import RouteDAO from "../../services/interfaces/dao/RouteDAO"
import TripDAO from "../../services/interfaces/dao/TripDAO"
import TripLinkDAO from "../../services/interfaces/dao/TripLinkDAO"
import TripLinkEstimateDAO from "../../services/interfaces/dao/TripLinkEstimateDAO"
import RouteDAOImpl from "./RouteDAOImpl"
import TripDAOImpl from "./TripDAOImpl"
import TripLinkDAOImpl from "./TripLinkDAOImpl"
import TripLinkEstimateDAOImpl from "./TripLinkEstimateDAOImpl"
import { defineTripModel, TripDbModel } from "./models/TripDbModel"
import { defineTripLinkModel, TripLinkDbModel } from "./models/TripLinkDbModel"
import {
  defineTripLinkEstimateModel,
  TripLinkEstimateDbModel,
} from "./models/TripLinkEstimateDbModel"

const { host, name: dbName, user, password } = config.operationalDb

export default class MysqlOperationalDbContext implements OperationalDbContext {
  private sequelize: Sequelize
  private tripModel: TripDbModel
  private tripLinkModel: TripLinkDbModel
  private tripLinkEstimateModel: TripLinkEstimateDbModel

  constructor() {
    this.sequelize = new Sequelize(dbName, user, password, {
      host,
      dialect: "mysql",
      logging: false,
    })
    this.tripModel = defineTripModel(this.sequelize)
    this.tripLinkModel = defineTripLinkModel(this.sequelize)
    this.tripLinkEstimateModel = defineTripLinkEstimateModel(this.sequelize)
  }

  async sync() {
    await this.sequelize.sync()
  }

  getRouteDAO(): RouteDAO {
    return new RouteDAOImpl()
  }

  getTripDAO(): TripDAO {
    return new TripDAOImpl(this.tripModel, this.getRouteDAO())
  }

  getTripLinkDAO(): TripLinkDAO {
    return new TripLinkDAOImpl(this.tripLinkModel)
  }

  getTripLinkEstimateDAO(): TripLinkEstimateDAO {
    return new TripLinkEstimateDAOImpl(this.tripLinkEstimateModel)
  }
}
