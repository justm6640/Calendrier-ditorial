# Dockerfile de production pour Next.js (SSR)
FROM node:20-alpine AS base

# 1. Installer les dépendances uniquement si nécessaire
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copier les fichiers de package
COPY package.json package-lock.json* ./
RUN npm ci

# 2. Reconstruire le code source
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables d'environnement pour le build
# Note: Ces variables doivent être présentes au build pour Next.js (sauf si configurées différemment)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# 3. Image de production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Autoriser le standalone pour réduire la taille de l'image (si configuré dans next.config.ts)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
