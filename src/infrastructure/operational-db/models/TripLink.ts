import { Sequelize, DataTypes, Model, ModelCtor } from "sequelize"

interface TripLinkAttributes {
  tripId: string
  linkId: string
  travelledTime: number
}

export type TripLinkSequelizeModel = ModelCtor<Model<TripLinkAttributes>>

export function defineTripLinkModel(sequelize: Sequelize) {
  return sequelize.define<Model<TripLinkAttributes>>(
    "TripLink",
    {
      tripId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      linkId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      travelledTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
    }
  )
}
