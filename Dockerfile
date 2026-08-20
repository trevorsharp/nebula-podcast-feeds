FROM oven/bun:alpine AS base
WORKDIR /app

RUN apk add --no-cache ffmpeg nginx

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production
COPY ./src ./src

COPY nginx.conf /etc/nginx/nginx.conf

# Run application
EXPOSE 3000/tcp
CMD ["sh", "-c", "nginx && bun run start"]
