import path from 'node:path';
import { default as express, Router } from 'express';
import { compileView, views } from './render.js';
import { userFields } from './user-api.js';
import { publicationFields } from './publication-api.js';
import apiRouter from './api.js';

const router = Router();

router.use(express.static('public'));

router.use((_, res, next) => {
  res.locals.ctx = {
    scripts: [],
    styles: ['main']
  };
  next();
});

router.get('/', (_, res) => res.redirect('/home'));

router.get('/home', (_, res, next) => {
  res.locals.ctx.fields = {
    user: userFields,
    publication: publicationFields
  };
  next();
});

router.use((req, res, next) => {
  const name = req.path.slice(1);
  if (!views.includes(name)) { return next(); }
  res.locals.ctx.scripts.push(name);
  res.locals.ctx.styles.push(name);
  res.send(compileView(name, res.locals.ctx));
});

router.use('/api', apiRouter);

router.use((req, res) => {
  res.status(404);
  if ([
    'css',
    'js'
  ].some((ext) => req.path.endsWith(`.${ext}`))) {
    return res
    .contentType(path.basename(req.path))
    .send();
  }
  res.send(compileView('.not-found'));
});

export default router;
