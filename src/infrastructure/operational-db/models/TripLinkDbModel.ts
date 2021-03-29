import { Sequelize, DataTypes, Model, ModelCtor } from "sequelize"
import { TripLink } from "../../../domain/model"

export type TripLinkDbModel = ModelCtor<Model<TripLink>>

export function defineTripLinkModel(sequelize: Sequelize) {
  return sequelize.define<Model<TripLink>>(
    "TripLink",
    {
      tripId: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      linkId: {
        type: DataTypes.STRING,
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
    },
    {
      timestamps: false,
    }
  )
}
