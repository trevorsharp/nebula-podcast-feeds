FROM oven/bun:alpine AS base
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production
COPY ./src ./src

# Run application
EXPOSE 3000/tcp
CMD bun run start