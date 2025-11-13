FROM node:20-alpine

# Install pnpm globally using corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV WATCHPACK_POLLING=true

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set proper permissions for the app directory (will be set up when volume mounts)
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install dependencies if needed and start dev server
CMD sh -c "if [ ! -d 'node_modules' ] || [ ! -f 'node_modules/.pnpm/lock.yaml' ]; then echo 'Installing dependencies...' && pnpm install --no-frozen-lockfile; fi && echo 'Starting Next.js dev server...' && pnpm dev"