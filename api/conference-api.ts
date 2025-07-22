import { Router } from 'express';
import sequelize from '../database/database.js';
import {
  createBodyFilter,
  createModelCreator,
  createModelAllResultGetter
} from './util.js';

const { conference } = sequelize.models;

const router = Router();

router.get('/', createModelAllResultGetter(conference));

const conferenceBodyFilter = createBodyFilter(conference, [
  'name',
  'category'
]);

router.post('/', conferenceBodyFilter, createModelCreator(conference));

router.get('/columns', (_, res) => {
  res.json(Object.keys(conference.getAttributes()));
});

export default router;

