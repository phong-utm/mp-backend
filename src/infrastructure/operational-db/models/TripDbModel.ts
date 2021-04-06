import { Sequelize, DataTypes, Model, ModelCtor } from "sequelize"
import { Trip } from "../../../domain/model"

export type TripDbModel = ModelCtor<Model<Trip>>

export function defineTripModel(sequelize: Sequelize) {
  return sequelize.define<Model<Trip>>(
    "Trip",
    {
      tripId: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      routeId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      scheduledStart: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dayId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      driver: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  )
}
