FROM node:20-alpine

# Install pnpm globally using corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV WATCHPACK_POLLING=true

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package.json and pnpm-lock.yaml before installing dependencies
COPY package.json pnpm-lock.yaml* ./

# Install dependencies using pnpm (development mode, allow lockfile updates)
RUN pnpm install

# Copy the rest of the application files
COPY . .

# Set proper permissions for the app directory
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run the development server with hot reload
CMD ["pnpm", "dev"]