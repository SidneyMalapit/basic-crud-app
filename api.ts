import { default as express, Router } from 'express';
import connection from './database.js';
import userRouter from './user-api.js';
import publicationRouter from './publication-api.js';

const apiRouter = Router();

apiRouter.use(express.urlencoded());

apiRouter.use('/users', userRouter);
apiRouter.use('/publications', publicationRouter);

export default apiRouter;
