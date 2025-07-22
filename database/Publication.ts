import { DataTypes, Sequelize } from 'sequelize';

const init = (sequelize: Sequelize) => sequelize.define('publication', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  conference_id: {
    type: DataTypes.INTEGER,
    unique: true
  }
});

export default init;
