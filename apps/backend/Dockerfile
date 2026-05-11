# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies (including devDependencies for tsc)
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code and compile TypeScript
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and install production dependencies only
COPY package.json package-lock.json* ./
RUN npm install --omit=dev && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Expose the port (configurable via env)
EXPOSE ${PORT:-3001}

# Run as non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001
USER backend

# Start the application
CMD ["node", "dist/index.js"]
