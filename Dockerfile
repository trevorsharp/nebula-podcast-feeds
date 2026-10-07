FROM oven/bun:alpine AS base
WORKDIR /app

# Install dependencies
RUN apk add --no-cache ffmpeg nginx

# Install packages
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy code
COPY index.ts ./
COPY ./src ./src

# Copy NGINX configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000/tcp
CMD ["sh", "-c", "nginx && bun run start"]
