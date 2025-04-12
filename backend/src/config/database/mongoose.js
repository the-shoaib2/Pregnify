import mongoose from 'mongoose';
import logger from '../logger.js';

const connectMongoDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('MongoDB Connected Successfully..☘️');
    return connection;
  } catch (error) {
    logger.error('MongoDB Connection Error:', error);
    throw error;
  }
};

export default connectMongoDB; 