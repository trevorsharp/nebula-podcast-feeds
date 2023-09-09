FROM oven/bun

WORKDIR /app

COPY package.json ./package.json
COPY bun.lockb  ./bun.lockb

RUN bun install

COPY . .

EXPOSE 3000

ENV NODE_ENV="production"

CMD bun start