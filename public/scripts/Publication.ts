import { addRow, deleteRow } from './GenericSchemaHandlers.js';

export const addPublication = addRow<IPublication>('publication');

export const deletePublication = deleteRow('publication');

export interface IPublication {
  id?: number;
  student_id: string;
  title: string;
  year: number;
}
