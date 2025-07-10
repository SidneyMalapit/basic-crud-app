import { default as express, Router } from 'express';
import connection from './database.js';
import publicationSchema from './publication-schema.js';

const publicationRouter = Router();

publicationRouter.use(express.urlencoded());

const publicationFields = (await connection.query(`SELECT * FROM publications`))[1]
.map((entry) => entry.name);

publicationRouter.get('/', async (_, res) => {
  try {
    const [result] = await connection.query(`SELECT * FROM publications`);
    res.json({
      result,
      fields: publicationFields
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({});
  }
});

publicationRouter.post('/', async (req, res) => {
  try {
    await publicationSchema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).json(error);
  }

  const { student_id, title, year } = req.body;

  let id;
  try {
    id = (await connection.query(
      `
      INSERT INTO publications
      (student_id, title, year)
      VALUES(?, ?, ?)
      `,
      [student_id, title, year]
    ) as any)[0].insertId;
  } catch (error) {
    console.error(error);
    return res.status(500).json({});
  }

  res.status(201).json({ id });
});

publicationRouter.patch('/:id', async (req, res) => {
  let result;

  try {
    result = ((await connection.query(
      `
      SELECT * FROM publications
      WHERE id = ?
      `,
      [req.params.id]
    ))[0] as any)[0];

    if (!result) {
      return res.status(404).json({});
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({})
  }

  Object.assign(result, req.body);
  delete result?.id;

  try {
    await publicationSchema.validateAsync(result);
  } catch (error) {
    return res.status(400).json(error);
  }

  try {
    await connection.query(
      `
      UPDATE publications
      SET student_id = ?,
          title = ?,
          year = ?
      WHERE id = ?
      `,
      [
        result.student_id,
        result.title,
        result.year,
        req.params.id
      ]
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({});
  }

  res.status(200).json({
    id: req.params.id,
    ...result
  });
});

publicationRouter.delete('/:id', async (req, res) => {
  if (!await doesPublicationExist(parseInt(req.params.id))) {
    return res.status(404).json({});
  }

  try {
    await connection.query(
      `
      DELETE FROM publications
      WHERE id = ?
      `,
      [req.params.id]
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({});
  }

  res.status(204).json({});
});

async function doesPublicationExist(id: number) {
  const [result] = (await connection.query(
    `
    SELECT COUNT(*)
    FROM publications
    WHERE id = ?
    `,
    [id]
  )) as [any, any];
  return !!result[0]['COUNT(*)'];
}

export default publicationRouter;
