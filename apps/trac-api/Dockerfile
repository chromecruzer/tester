FROM node:lts-alpine
RUN apk add --no-cache bash curl
WORKDIR /app
COPY dist/apps/trac-api /app/
COPY package.json /app/
RUN npm install --legacy-peer-deps
CMD node --max-old-space-size=8192 main.js --configPath /var/lib/trac/config
#CMD ls /var/lib/trac/config
