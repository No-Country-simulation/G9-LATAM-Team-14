FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist/frontend-Angular ./dist/frontend-Angular
EXPOSE 4000
CMD ["node", "dist/frontend-Angular/server/server.mjs"]