FROM node:22.14-alpine

ENV NODE_ENV=production \
    PORT=8080 \
    WINNIE_DB_PATH=/data/winnie.db

WORKDIR /app
COPY --chown=node:node package.json server.js login.html admin.html index.html documentation.html default_background.jpg namelist.txt stafflist-custom-field.csv ./
COPY --chown=node:node template ./template

RUN mkdir -p /data && chown node:node /data

USER node
VOLUME ["/data"]
EXPOSE 8080

CMD ["node", "server.js"]
