import { DataTypes, Sequelize } from 'sequelize';

const init = (sequelize: Sequelize) => sequelize.define('conference', {
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false }
});

export default init;
