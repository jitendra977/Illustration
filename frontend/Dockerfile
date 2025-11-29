FROM node:20-bullseye

WORKDIR /app

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

COPY package.json ./
RUN bun install

COPY . .

# Build production
RUN bun run build

# Copy build to Nginx folder
CMD ["cp", "-r", "dist", "/usr/share/nginx/html"]