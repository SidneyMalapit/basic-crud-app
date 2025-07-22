import { Router } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../database/database.js';
import {
  createBodyFilter,
  createModelCreator,
  createModelUpdater,
  createModelDeleter
} from './util.js';

const { publication } = sequelize.models;

const router = Router();

const publicationBodyFilter = createBodyFilter(publication, [
  'student_id',
  'title',
  'year',
  'conference_id'
]);

router.post('/', publicationBodyFilter, createModelCreator(publication));

const getJoinedResultsQuery = (condition = '') => {
  return `
SELECT 
  publications.id,
  publications.title,
  publications.year,
  CONCAT(users.first_name, ' ', users.last_name) AS student_name,
  conferences.name AS conference_name,
  conferences.category AS conference_category
FROM publications
INNER JOIN users       ON publications.student_id    = users.id
INNER JOIN conferences ON publications.conference_id = conferences.id
${condition}
ORDER BY id
  `;
}
router.get('/', async (_, res) => {
  try {
    res.json(await sequelize.query(getJoinedResultsQuery(), { type: QueryTypes.SELECT }));
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

router.get('/columns', async (_, res) => {
  res.json('id title year student_name conference_name conference_category'.split(' '));
});

router.get('/:id', async (req, res) => {
  try {
    const result = await sequelize.query(getJoinedResultsQuery(`AND publications.id = ${req.params.id}`), { type: QueryTypes.SELECT});
    if (result.length === 0) { res.status(404); }
    res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

router.put('/:id', publicationBodyFilter, createModelUpdater(publication));

router.delete('/:id', createModelDeleter(publication));

export default router;
