import swaggerAutogen from 'swagger-autogen';
import { PORT } from "./config/env.js";
const doc = {
  info: {
    title: 'Nodejs Sample Chat App',
    description: 'A Simple Realtime Chat App (Node.js + Socket.IO + Docker + PostgreSQL)'
  },
  host: PORT ? `localhost:${PORT}` : 'localhost:3001'
};

const outputFile = './swagger-output.json';
const routes = ['./server.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen()(outputFile, routes, doc).then(async () => {
  await import('./server.js');
});