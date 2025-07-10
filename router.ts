import { default as express, Router } from 'express';
import { compileView, views } from './render.js';

const router = Router();

router.use(express.static('public'));

router.get('/', (_, res) => res.redirect('/home'));

router.use((req, res, next) => {
  const name = req.path.slice(1);
  if (!views.includes(name)) { return next(); }
  res.send(compileView(name));
});

router.use((_, res) => {
  res.status(404).send(compileView('.not-found'));
});

export default router;
