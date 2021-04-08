import { Sequelize, Model, DataTypes } from "sequelize"

import { FactOverallPeriodAttributes } from "../../../services/interfaces/dao/AnalyticsDbContext"

// prettier-ignore
export class FactOverallPeriod extends Model<FactOverallPeriodAttributes> implements FactOverallPeriodAttributes {
  public period!: string
  public ha!: number
  public ewt!: number
  public otp!: number
}

export function initFactOverallPeriodModel(sequelize: Sequelize) {
  FactOverallPeriod.init(
    {
      period: {
        type: DataTypes.STRING(7),
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
