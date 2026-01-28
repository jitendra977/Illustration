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

# Set build-time environment variables for Vite
# These will be baked into the build
ARG VITE_API_URL=/api
ARG VITE_API_BASE_URL=/api
ARG VITE_APP_NAME="Yaw Illustration"
ARG VITE_APP_URL=/
ARG VITE_ENV=production
ARG VITE_MEDIA_URL=/media
ARG VITE_STATIC_URL=/static

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_ENV=$VITE_ENV
ENV VITE_MEDIA_URL=$VITE_MEDIA_URL
ENV VITE_STATIC_URL=$VITE_STATIC_URL

# Build the app (Vite will use the ENV variables above)
RUN bun run build

# ===========================
# Production Stage
# ===========================
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
