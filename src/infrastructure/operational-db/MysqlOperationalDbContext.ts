import { Sequelize } from "sequelize"

import config from "../../common/config"
import OperationalDbContext from "../../services/interfaces/dao/OperationalDbContext"
import RouteDAOImpl from "./RouteDAOImpl"
import TripDAOImpl from "./TripDAOImpl"
import TripLinkDAOImpl from "./TripLinkDAOImpl"
import TripLinkEstimateDAOImpl from "./TripLinkEstimateDAOImpl"
import TripLinkScheduleDAOImpl from "./TripLinkScheduleDAOImpl"
import AnalyticsDAOImpl from "./AnalyticsDAOImpl"
import { defineTripModel, TripDbModel } from "./models/TripDbModel"
import { defineTripLinkModel, TripLinkDbModel } from "./models/TripLinkDbModel"
import {
  defineTripLinkEstimateModel,
  TripLinkEstimateDbModel,
} from "./models/TripLinkEstimateDbModel"
import {
  defineTripLinkScheduleModel,
  TripLinkScheduleDbModel,
} from "./models/TripLinkScheduleDbModel"

// import { defineRouteModel, RouteDbModel } from "./models/RouteDbModel"

const { host, name: dbName, user, password } = config.operationalDb

export default class MysqlOperationalDbContext implements OperationalDbContext {
  private sequelize: Sequelize
  private tripModel: TripDbModel
  private tripLinkModel: TripLinkDbModel
  private tripLinkEstimateModel: TripLinkEstimateDbModel
  private tripLinkScheduleModel: TripLinkScheduleDbModel
  // private routeModel: RouteDbModel

  constructor() {
    this.sequelize = new Sequelize(dbName, user, password, {
      host,
      dialect: "mysql",
      logging: false,
    })
    this.tripModel = defineTripModel(this.sequelize)
    this.tripLinkModel = defineTripLinkModel(this.sequelize)
    this.tripLinkEstimateModel = defineTripLinkEstimateModel(this.sequelize)
    this.tripLinkScheduleModel = defineTripLinkScheduleModel(this.sequelize)
    // this.routeModel = defineRouteModel(this.sequelize)
  }

  async sync() {
    await this.sequelize.sync()
  }

  getRouteDAO() {
    return new RouteDAOImpl()
  }

  getTripDAO() {
    return new TripDAOImpl(this.tripModel, this.getRouteDAO())
  }

  getTripLinkDAO() {
    return new TripLinkDAOImpl(this.tripLinkModel)
  }

  getTripLinkEstimateDAO() {
    return new TripLinkEstimateDAOImpl(this.tripLinkEstimateModel)
  }

  getTripLinkScheduleDAO() {
    return new TripLinkScheduleDAOImpl(this.tripLinkScheduleModel)
  }

  getAnalyticsDAO() {
    return new AnalyticsDAOImpl(this.sequelize)
  }
}
