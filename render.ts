import fs from 'node:fs';
import Handlebars from 'handlebars';

const mainTemplate = Handlebars.compile(fs.readFileSync('views/templates/main.hbs', { encoding: 'utf8' }));

export const views = fs.readdirSync('views', { encoding: 'utf8' })
  .filter((name) => name.endsWith('.hbs'))
  .map((name) => name.slice(0, -4));

const partials = fs.readdirSync('views/partials', { encoding: 'utf8' });

for (const partial of partials) {
  if (!partial.endsWith('.hbs')) { continue; }
  Handlebars.registerPartial(partial.slice(0, -4), getPartial(partial));
}

export function compileView(name: string, ctx = {}, template = mainTemplate) {
  return template({
    body: Handlebars.compile(getView(name)),
    ...ctx
  });
}

export function getView(name: string) {
  return fs.readFileSync(`views/${name}.hbs`, { encoding: 'utf8' });
}

function getPartial(name: string) {
  return fs.readFileSync(`views/partials/${name}`, { encoding: 'utf8' });
}
