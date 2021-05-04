import { Sequelize, DataTypes, Model, ModelCtor } from "sequelize"
import { TripLinkEstimate } from "../../../domain/model"

export type TripLinkEstimateDbModel = ModelCtor<Model<TripLinkEstimate>>

export function defineTripLinkEstimateModel(sequelize: Sequelize) {
  return sequelize.define<Model<TripLinkEstimate>>(
    "TripLinkEstimate",
    {
      tripId: {
        type: DataTypes.STRING(100),
        primaryKey: true,
      },
      linkId: {
        type: DataTypes.STRING(100),
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
