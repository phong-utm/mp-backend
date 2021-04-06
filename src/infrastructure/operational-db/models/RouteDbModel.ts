import { Sequelize, DataTypes, Model, ModelCtor } from "sequelize"
// import { RouteData } from "../../../domain/model"

export type RouteDbModel = ModelCtor<Model<RouteAttributes>>

interface RouteAttributes {
  routeId: string
  origin: string
  destination: string
}

interface DriverAttributes {
  name: string
}

// interface RouteInstance extends Model<RouteAttributes>, RouteAttributes {}

export function defineRouteModel(sequelize: Sequelize) {
  const Route = sequelize.define<Model<RouteAttributes>>(
    "Route",
    {
      routeId: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      origin: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      destination: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  )

  const Driver = sequelize.define<Model<DriverAttributes>>(
    "Driver",
    {
      name: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
    },
    {
      timestamps: false,
    }
  )

  Driver.belongsTo(Route, { foreignKey: "routeId" })
  Route.hasMany(Driver, { foreignKey: "routeId" })

  return Route
}
