# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app
COPY server/package*.json server/tsconfig.json ./server/
RUN cd server && npm ci
COPY server ./server
RUN cd server && npm run build

FROM node:20-alpine
WORKDIR /app/server
COPY --from=build /app/server/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/server/dist ./dist
ENV PORT=8787
EXPOSE 8787
CMD ["node", "dist/index.js"]