FROM docker.io/library/node:14
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm
WORKDIR /app/
COPY pnpm-lock.yaml ./
RUN pnpm fetch
ADD . ./
RUN pnpm install -r --offline
EXPOSE 8123
CMD [ "pnpm", "ts-node", "proxy.ts" ]