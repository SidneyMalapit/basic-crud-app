import { addRow, deleteRow } from './GenericSchemaHandlers.js';

export const addUser = addRow<IUser>('user');

export const deleteUser = deleteRow('user');

export interface IUser {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
}
