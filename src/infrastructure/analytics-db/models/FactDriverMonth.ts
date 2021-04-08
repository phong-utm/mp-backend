import { Sequelize, Model, DataTypes } from "sequelize"

import { FactDriverMonthAttributes } from "../../../services/interfaces/dao/AnalyticsDbContext"

// prettier-ignore
export class FactDriverMonth extends Model<FactDriverMonthAttributes> implements FactDriverMonthAttributes {
  public period!: string
  public month!: string
  public route!: string
  public driver!: string
  public otp!: number
}

export function initFactDriverMonthModel(sequelize: Sequelize) {
  FactDriverMonth.init(
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
      driver: {
        type: DataTypes.STRING(50),
        primaryKey: true,
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
