import 'dotenv/config';
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import jwt from 'jsonwebtoken';
const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();
const angularApp = new AngularNodeAppEngine({
  allowedHosts: ['localhost']
});
const JWT_SECRET = process.env['JWT_SECRET'];
if (!JWT_SECRET) throw new Error('FATAL: La variable de entorno JWT_SECRET no está definida.');
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, item) => {
    const [key, value] = item.trim().split('=');
    if (key) acc[key] = value;
    return acc;
  }, {});
  const token = cookies['jwt'];
  let isValidJwt = false;
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      isValidJwt = true;
    } catch (err) {
      isValidJwt = false;
    }
  }
  if ((req.path.startsWith('/dashboard') || req.path.startsWith('/onboarding')) && !isValidJwt) {
    return res.redirect(302, '/login');
  }
  if ((req.path === '/login' || req.path === '/registro') && isValidJwt) {
    return res.redirect(302, '/dashboard');
  }
  next();
});

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) throw error;
    console.log(`Servidor Node listo en http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);