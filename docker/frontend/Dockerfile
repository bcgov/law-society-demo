FROM node:erbium

WORKDIR /app

ADD a2a-demo /app

RUN npm install

ENV PATH="/app/node_modules/@angular/cli/bin:${PATH}"

RUN ng build --prod

COPY config/Caddyfile /etc/Caddyfile
