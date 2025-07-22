import { Router } from 'express';
import sequelize from '../database/database.js';
import {
  createBodyFilter,
  createModelCreator,
  createModelAllResultGetter
} from './util.js';

const { user } = sequelize.models;

const router = Router();

router.get('/', createModelAllResultGetter(user));

router.get('/columns', async (_, res) => {
  res.json(Object.keys(user.getAttributes()));
});

const userBodyFilter = createBodyFilter(user, [
  'email',
  'first_name',
  'last_name'
]);

router.post('/', userBodyFilter, createModelCreator(user));

export default router;
