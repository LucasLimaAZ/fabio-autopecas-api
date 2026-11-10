"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Sale extends Model {
    static associate(models) {
      Sale.hasMany(models.SaleItem, {
        foreignKey: "sale_id",
        as: "items",
      });
      Sale.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }

  Sale.init(
    {
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      sale_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Sale",
      tableName: "sales",
    },
  );

  return Sale;
};
