# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Tools for sqlite3 build + git/pnpm for snapshot logic
RUN apk add --no-cache \
  git \
  python3 \
  make \
  g++ \
  && corepack enable

# Install dependencies (include devDeps so tsc is available)
COPY package*.json tsconfig*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build && npm prune --omit=dev

# Now set runtime env
ENV NODE_ENV=production

# Data volume (ignoring .env)
VOLUME ["/data"]

CMD ["node", "dist/index.js"]