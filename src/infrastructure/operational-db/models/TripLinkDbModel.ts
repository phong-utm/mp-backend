import { Sequelize, DataTypes, Model, ModelCtor } from "sequelize"
import { TripLink } from "../../../domain/model"

export type TripLinkDbModel = ModelCtor<Model<TripLink>>

export function defineTripLinkModel(sequelize: Sequelize) {
  return sequelize.define<Model<TripLink>>(
    "TripLink",
    {
      tripId: {
        type: DataTypes.STRING(100),
        primaryKey: true,
      },
      linkId: {
        type: DataTypes.STRING(100),
        primaryKey: true,
      },
      travelledTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      arrivedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      headway: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: false,
    }
  )
}
