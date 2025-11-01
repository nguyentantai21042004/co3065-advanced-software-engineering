# Runtime-only container
# Build the application first on host: cd frontend && pnpm install && pnpm build
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create directory structure - files will be mounted via volumes in docker-compose
RUN mkdir -p .next/static public && chown -R nextjs:nodejs /app

# Files are mounted via volumes in docker-compose.yml
# Build the app first: pnpm install && pnpm build

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Keep container running - exec into it and run: node server.js
CMD ["sh", "-c", "while true; do sleep 86400; done"]