import { Sequelize, DataTypes, Model, ModelCtor } from "sequelize"
import { TripLinkSchedule } from "../../../domain/model"

export type TripLinkScheduleDbModel = ModelCtor<Model<TripLinkSchedule>>

export function defineTripLinkScheduleModel(sequelize: Sequelize) {
  return sequelize.define<Model<TripLinkSchedule>>(
    "TripLinkSchedule",
    {
      tripId: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      linkId: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      scheduledArrival: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  )
}
