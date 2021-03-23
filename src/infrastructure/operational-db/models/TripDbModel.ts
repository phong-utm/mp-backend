import { Sequelize, DataTypes, Model, ModelCtor } from "sequelize"
import { TripAttributes } from "../../../domain/model"

export type TripDbModel = ModelCtor<Model<TripAttributes>>

export function defineTripModel(sequelize: Sequelize) {
  return sequelize.define<Model<TripAttributes>>(
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
    },
    {
      timestamps: false,
    }
  )
}
