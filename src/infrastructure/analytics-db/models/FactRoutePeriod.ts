import { Sequelize, Model, DataTypes } from "sequelize"

import { FactRoutePeriodAttributes } from "../../../services/interfaces/dao/AnalyticsDbContext"

// prettier-ignore
export class FactRoutePeriod extends Model<FactRoutePeriodAttributes> implements FactRoutePeriodAttributes {
  public period!: string
  public route!: string
  public ha!: number
  public ewt!: number
  public otp!: number
}

export function initFactRoutePeriodModel(sequelize: Sequelize) {
  FactRoutePeriod.init(
    {
      period: {
        type: DataTypes.STRING(7),
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
      timestamps: false,
      freezeTableName: true,
    }
  )
}
