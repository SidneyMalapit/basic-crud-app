import { default as express, Router } from 'express';
import { default as userRouter } from './user-api.js';
import { default as publicationRouter } from './publication-api.js';
import { default as conferenceRouter } from './conference-api.js';

const apiRouter = Router();

apiRouter.use(express.json());

apiRouter.use('/users', userRouter);
apiRouter.use('/publications', publicationRouter);
apiRouter.use('/conferences', conferenceRouter);

export default apiRouter;
