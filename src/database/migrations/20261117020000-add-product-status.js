"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("products", "status", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "active",
    });

    await queryInterface.addIndex("products", ["status"]);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("products", ["status"]);
    await queryInterface.removeColumn("products", "status");
  },
};
