FROM oven/bun:alpine AS base
WORKDIR /app

RUN apk add --no-cache ffmpeg nginx

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY ./src ./index.ts ./

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000/tcp
CMD ["sh", "-c", "nginx && bun run start"]
