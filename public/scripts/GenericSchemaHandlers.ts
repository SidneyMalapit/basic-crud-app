import { IUser } from './User.js';
import { IPublication } from './Publication.js';

export function addRow<T extends IUser | IPublication>(type: 'user' | 'publication') {
  return (item: T) => {
    delete item.id;
    return fetch(`/api/${type}s`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    }).then((res) => res.json());
  };
}

export function deleteRow(type: 'user' | 'publication') {
  return (id: number) => {
    return fetch(`/api/${type}s/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then((res) => res.json());
  };
}
