FROM node:erbium
WORKDIR /app
#  Copy caddyfile for later use in chained build
COPY config/Caddyfile /app/config/Caddyfile
COPY a2a-demo/package*.json ./
RUN npm install
COPY a2a-demo/ .
RUN npm run build
