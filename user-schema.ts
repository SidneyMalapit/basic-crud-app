import Joi from 'joi';
import connection from './database.js';

export const emailSchema = Joi
.string()
.required()
.max(255)
.email()
.external(async (email) => {
  if (await isUnique(email)) { return email; }
  throw new Joi.ValidationError(
    'email.unique',
    [
      {
        message: 'Email is already registered in `users`',
        path: ['email'],
        type: 'email.unique',
        context: {
          key: 'email',
          label: 'email',
          email,
        },
      },
    ],
    email
  );
});

export const nameSchema = Joi
.string()
.required()
.max(45);

const userSchema = Joi.object({
  email: emailSchema,
  first_name: nameSchema,
  last_name: nameSchema
}).required().unknown(false);

export async function isUnique(email: string): Promise<boolean> {
  const [result] = (await connection.query(
    `
    SELECT COUNT(*)
    FROM users
    WHERE email = ?
      `,
    [email]
  )) as [any, any];
  return !result[0]['COUNT(*)'];
}

export interface IUser {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
}

export default userSchema;
