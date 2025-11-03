FROM denoland/deno:1.37.0

WORKDIR /app

COPY . .

CMD ["deno", "run", "--allow-net", "--allow-env", "--watch", "/_shared/server.ts"]