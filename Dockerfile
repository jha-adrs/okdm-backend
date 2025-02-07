FROM node:22-alpine as build

RUN apk update && \
    apk add --no-cache curl vim bash redis && \
    rm -rf /var/cache/apk/*
WORKDIR /usr/src/app
COPY package*.json ./
COPY ./prisma/schema.prisma /usr/src/app/prisma/schema.prisma
RUN npm install

COPY . .

RUN npm run build

# Start Redis in the background and then start the Node.js application
CMD redis-server --daemonize yes && npm start

EXPOSE 80