import 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import router from './router.js';

const app = express();

app.use(morgan('common'));

app.use(router);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT);
console.log(`app is listening on port ${PORT}`);
