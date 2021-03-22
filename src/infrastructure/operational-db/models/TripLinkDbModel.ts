import { Sequelize, DataTypes, Model, ModelCtor } from "sequelize"

interface TripLinkAttributes {
  tripId: string
  linkId: string
  travelledTime: number
}

export type TripLinkDbModel = ModelCtor<Model<TripLinkAttributes>>

export function defineTripLinkModel(sequelize: Sequelize) {
  return sequelize.define<Model<TripLinkAttributes>>(
    "TripLink",
    {
      tripId: {
        type: DataTypes.STRING,
        // allowNull: false,
        primaryKey: true,
      },
      linkId: {
        type: DataTypes.STRING,
        // allowNull: false,
        primaryKey: true,
      },
      travelledTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      // freezeTableName: true,
    }
  )
}
