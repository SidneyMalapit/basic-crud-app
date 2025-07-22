import path from 'node:path';
import { default as express, Router } from 'express';
import { compileView, views } from '../render.js';
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

router.use((req, res, next) => {
  const name = req.path.slice(1);
  if (!views.includes(name)) { return next(); }
  res.locals.ctx.scripts.push(name);
  res.locals.ctx.styles.push(name);
  res.locals.ctx.name = name;
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
  res.locals.ctx.name = 'not found';
  res.send(compileView('.not-found', res.locals.ctx));
});

export default router;
