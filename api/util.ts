import { RequestHandler } from 'express';
import sequelize from '../database/database.js';

type Model = typeof sequelize.models[string];

/**
 * @returns A middleware which takes certain fields from the request body and validates them against a given model
 *
 * Creates property `candidate` on `res.locals`
 */
export function createBodyFilter(filteredFields: string[]): RequestHandler {
  return async (req, res, next) => {

    res.locals.candidate = {};
    for (const name of filteredFields) {
      res.locals.candidate[name] = req.body[name];
    }

    next();
  };
}

export function createModelCreator(model: Model): RequestHandler {
  return async (_, res) => {
    try {
      const representation = await model.create(res.locals.candidate);
      res.json(representation.toJSON());
    } catch (error) {
      res.status(handleError(error)).json(error);
    }
  };
}

export function createModelAllResultGetter(model: Model): RequestHandler {
  return async (_, res) => {
    try {
      res.json(await model.findAll());
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  };
}

export function createModelUpdater(model: Model): RequestHandler {
  return async (req, res) => {
    try {
      const [ affected ] = await model.update(res.locals.candidate, { where: { id: req.params.id } });
      res.status(affected > 0 ? 204 : 404).json();
    } catch (error) {
      res.status(handleError(error)).json(error);
    }
  }
}

export function createModelDeleter(model: Model): RequestHandler {
  return async (req, res) => {
    try {
      const result = await model.destroy({ where: { id: req.params.id } });
      res.status(result > 0 ? 204 : 404).json();
    } catch (error) {
      res.status(handleError(error)).json(error);
    }
  }
}

function handleError(error: unknown) {
  if (!(error instanceof Error)) {
    console.error(error);
    return 500;
  }

  switch (error.name) {
    case 'SequelizeValidationError':
      case 'SequelizeUniqueConstraintError':
      case 'SequelizeForeignKeyConstraintError':
      return 400;
    case 'SequelizeTimeoutError':
      return 429;
    case 'SequelizeDatabaseError':
    default:
      console.error(error);
      return 500;
  }
}
