FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun --bun run build
EXPOSE 3001
CMD ["bun", "server/index.ts"]
