import fs from 'node:fs';
import Handlebars from 'handlebars';

const mainTemplate = Handlebars.compile(fs.readFileSync('views/templates/main.hbs', { encoding: 'utf8' }));

export function compileView(name: string, template = mainTemplate, ctx = {}) {
  return template({
    body: getView(name),
    ...ctx
  });
}

export function getView(name: string) {
  return fs.readFileSync(`views/${name}.hbs`, { encoding: 'utf8' });
}
