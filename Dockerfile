FROM node:22-bookworm-slim AS app

WORKDIR /app

RUN corepack enable

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @ankion/api run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/index.js"]
