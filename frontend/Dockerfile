# ========================================
# frontend/Dockerfile
# ========================================
# ===========================
# Build Stage
# ===========================
FROM oven/bun:1-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Copy production environment file
# This ensures production builds use the correct API URL
COPY .env.production .env

# Build the app (Vite will read from .env file)
RUN bun run build

# ===========================
# Production Stage
# ===========================
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
