# syntax=docker/dockerfile:1
FROM alpine:3.15 AS node-sharp

ENV NODE_ENV=production
WORKDIR /app
COPY . /app

# python and gcc are used to build sharp npm library !
RUN apk add --update nodejs npm
RUN apk add --no-cache python3 py3-pip
RUN apk add build-base
RUN npm install --production

FROM alpine:3.15

EXPOSE 3333
VOLUME ["/app/photos"]
WORKDIR /app

RUN apk add --update nodejs
COPY --from=node-sharp /app/node_modules /app/node_modules
COPY . /app

CMD ["node", "server.js"]
