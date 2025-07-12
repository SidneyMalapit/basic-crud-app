import 'dotenv/config';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  user: 'root',
  password: process.env.DBPASSWORD,
  database: process.env.DBNAME
});

export default connection;

export type MySQLResult = [mysql.ResultSetHeader, mysql.FieldPacket[]];
