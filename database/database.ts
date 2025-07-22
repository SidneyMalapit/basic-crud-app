import 'dotenv/config';
import { Sequelize } from 'sequelize';

import { default as initUser } from './User.js';
import { default as initConference } from './Conference.js';
import { default as initPublication } from './Publication.js';

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  dialect: 'mysql',
  define: { timestamps: false }
});

initUser(sequelize);
initConference(sequelize);
initPublication(sequelize);

associations: {
  const { user, conference, publication } = sequelize.models;

  user.hasMany(publication, { foreignKey: 'student_id' });
  publication.belongsTo(user, { foreignKey: 'student_id' });
  conference.hasOne(publication, { foreignKey: 'conference_id' });
  publication.belongsTo(conference, { foreignKey: 'conference_id' });
}

try {
  await sequelize.authenticate();
  console.log(`mysql connected using database "${process.env.DB_NAME}"`);
} catch (error) {
  console.error('could not connect to databse', error);
}

sequelize.sync();

export default sequelize;
