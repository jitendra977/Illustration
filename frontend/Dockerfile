# ===========================
# Build Stage
# ===========================
FROM oven/bun:1-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files (lock file must exist)
COPY package.json bun.lockb ./

# Install dependencies using lockfile
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build app (React / Vite / Bun)
RUN bun run build

# ===========================
# Production Stage
# ===========================
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]