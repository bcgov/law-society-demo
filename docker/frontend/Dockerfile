FROM node:erbium as builder

WORKDIR /app

ADD a2a-demo /app

RUN npm install

ENV PATH="/app/node_modules/@angular/cli/bin:${PATH}"

RUN ng build --prod


FROM abiosoft/caddy:no-stats as runtime

COPY config/Caddyfile /etc/Caddyfile

COPY --from=builder /app/dist/a2a-demo /srv
