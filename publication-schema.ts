import Joi from 'joi';
import connection from './database.js';

export const studentIdSchema = Joi
.number()
.required()
.integer()
.positive()
.external(async (id) => {
  if (await doesUserExistById(id)) { return; }
  throw new Joi.ValidationError(
    'id.exists',
    [
      {
        message: `No user exists with ID \`${id}\``,
        path: ['id'],
        type: 'id.exists',
        context: {
          key: 'id',
          label: 'id',
          id,
        },
      },
    ],
    id
  );
});

export const titleSchema = Joi.string().required();

export const yearSchema = Joi
.number()
.required()
.integer();

const publicationSchema = Joi.object({
  student_id: studentIdSchema,
  title: titleSchema,
  year: yearSchema
}).required().unknown(false);

export async function doesUserExistById(id: number): Promise<boolean> {
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

export default publicationSchema;

