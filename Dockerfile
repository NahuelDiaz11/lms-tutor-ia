# Dockerfile multi-stage para ejecución rápida y liviana
FROM node:20-alpine AS base

WORKDIR /app

# Instalar dependencias
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Compilar proyecto y generar base de datos Prisma
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate
RUN npx prisma db push --accept-data-loss
RUN node scripts/seed.mjs
RUN npm run build

# Contenedor de producción final
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL="file:./dev.db"
ENV NEXTAUTH_SECRET="secret-poc-classedtech-2026"
ENV AI_PROVIDER="mock"

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dev.db ./dev.db
COPY --from=builder /app/.env.example ./.env

EXPOSE 3000

CMD ["npm", "start"]
