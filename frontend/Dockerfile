# Runtime-only container
# Build the application first on host: cd frontend && pnpm install && pnpm build
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy pre-built Next.js standalone output from host
# Build first on host: cd frontend && pnpm install && pnpm build
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static
COPY --chown=nextjs:nodejs public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Keep container running - exec into it and run: node server.js
CMD ["sh", "-c", "while true; do sleep 86400; done"]