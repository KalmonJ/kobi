FROM oven/bun:1.2.14

WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile
RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start:prod"]
