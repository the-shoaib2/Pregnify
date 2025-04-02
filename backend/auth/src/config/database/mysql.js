import mysql from 'mysql2/promise';
import logger from '../logger.js';

const connectMySQL = async () => {
  try {
    const connection = await mysql.createConnection(process.env.MYSQL_DATABASE_URL);
    
    await connection.connect();
    console.log('MySQL Connected Successfully.☘️');
    return connection;
  } catch (error) {
    console.log('MySQL Connection Error:', error);
    throw error;
  }
};

export default connectMySQL;
