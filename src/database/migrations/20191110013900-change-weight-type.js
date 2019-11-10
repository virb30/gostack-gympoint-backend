module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('students', 'weight', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('students', 'weight', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },
};
