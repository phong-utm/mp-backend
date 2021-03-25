import { Sequelize, DataTypes, Model, ModelCtor } from "sequelize"
import { EstTravelTime } from "../../../domain/model"

export type EstTravelTimeDbModel = ModelCtor<Model<EstTravelTime>>

export function defineEstTravelTimeModel(sequelize: Sequelize) {
  return sequelize.define<Model<EstTravelTime>>(
    "EstTravelTime",
    {
      tripId: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      linkId: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      estimatedTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  )
}
