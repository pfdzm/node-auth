FROM node:20-alpine AS base

FROM base AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*json src ./

RUN npm ci 

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 pfdzm

COPY --from=builder --chown=pfdzm:nodejs /app/node_modules /app/node_modules
COPY --from=builder --chown=pfdzm:nodejs /app/ /app/

USER pfdzm
EXPOSE 8080

CMD ["node", "index.js"]
