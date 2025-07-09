import { compileView } from './render';
import { default as express, Router } from 'express';

const router = Router();

router.use(express.static('public'));

router.get('/', (_, res) => res.redirect('/home'));

router.use((_, res) => {
  res.status(404).send(compileView('.not-found'));
});

export default router;
