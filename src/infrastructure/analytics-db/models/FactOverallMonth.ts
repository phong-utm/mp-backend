import { Sequelize, Model, DataTypes } from "sequelize"

import { FactOverallMonthAttributes } from "../../../services/interfaces/dao/AnalyticsDbContext"

// prettier-ignore
export class FactOverallMonth extends Model<FactOverallMonthAttributes> implements FactOverallMonthAttributes {
  public period!: string
  public month!: string
  public ha!: number
  public ewt!: number
  public otp!: number
}

export function initFactOverallMonthModel(sequelize: Sequelize) {
  FactOverallMonth.init(
    {
      period: {
        type: DataTypes.STRING(7),
        primaryKey: true,
      },
      month: {
        type: DataTypes.STRING(3),
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
