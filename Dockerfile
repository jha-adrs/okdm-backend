FROM node:22-alpine as build

RUN apk update && \
    apk add --no-cache curl vim bash && \
    rm -rf /var/cache/apk/*
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build
EXPOSE 80
CMD ["npm", "start"]