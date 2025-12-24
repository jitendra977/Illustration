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
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME
ARG VITE_APP_URL
ARG VITE_ENV
ARG VITE_MEDIA_URL
ARG VITE_STATIC_URL

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_ENV=$VITE_ENV
ENV VITE_MEDIA_URL=$VITE_MEDIA_URL
ENV VITE_STATIC_URL=$VITE_STATIC_URL

# Build the app
RUN bun run build
