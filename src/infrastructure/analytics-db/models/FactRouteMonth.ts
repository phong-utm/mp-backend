import { Sequelize, Model, DataTypes } from "sequelize"

import { FactRouteMonthAttributes } from "../../../services/interfaces/dao/AnalyticsDbContext"

// prettier-ignore
export class FactRouteMonth extends Model<FactRouteMonthAttributes> implements FactRouteMonthAttributes {
  public period!: string
  public month!: string
  public route!: string
  public ha!: number
  public ewt!: number
  public otp!: number
}

export function initFactRouteMonthModel(sequelize: Sequelize) {
  FactRouteMonth.init(
    {
      period: {
        type: DataTypes.STRING(7),
        primaryKey: true,
      },
      month: {
        type: DataTypes.STRING(3),
        primaryKey: true,
      },
      route: {
        type: DataTypes.STRING(20),
        primaryKey: true,
      },
      ha: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      ewt: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      otp: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      // timestamps: false,
      freezeTableName: true,
    }
  )
}
