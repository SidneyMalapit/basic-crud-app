import { Router } from 'express';
import connection from './database.js';
import { default as userSchema, IUser } from './user-schema.js';

const router = Router();

export const userFields = (await connection.query(`SELECT * FROM users`))[1]
.map((entry) => entry.name);

router.get('/', async (_, res) => {
  try {
    const [result] = await connection.query(`SELECT * FROM users`);
    res.json({
      result,
      fields: userFields
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({});
  }
});

router.post('/', async (req, res) => {
  try {
    await userSchema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).json(error);
  }

  const { email, first_name, last_name } = req.body;

  let id;
  try {
    id = (await connection.query(
      `
      INSERT INTO users
      (email, first_name, last_name)
      VALUES (?, ?, ?)
      `,
      [email, first_name, last_name]
    ) as any)[0].insertId;
  } catch (error) {
    console.error(error);
    return res.status(500).json({});
  }

  res.status(201).json({ id });
});

router.patch('/:id', async (req, res) => {
  let result;

  try {
    result = ((await connection.query(
      `
      SELECT * FROM users
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
    await userSchema.validateAsync(result);
  } catch (error) {
    return res.status(400).json(error);
  }

  try {
    await connection.query(
      `
      UPDATE users
      SET email = ?,
          first_name = ?,
          last_name = ?
      WHERE id = ?
      `,
      [
        result.email,
        result.first_name,
        result.last_name,
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

router.delete('/:id', async (req, res) => {
  if (!await doesUserExist(parseInt(req.params.id))) {
    return res.status(404).json({});
  }

  try {
    await connection.query(
      `
      DELETE FROM users
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

async function doesUserExist(id: number) {
  const [result] = (await connection.query(
    `
    SELECT COUNT(*)
    FROM users
    WHERE id = ?
    `,
    [id]
  )) as [any, any];
  return !!result[0]['COUNT(*)'];
}

export default router;
