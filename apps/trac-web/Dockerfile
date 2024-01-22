FROM node:lts-alpine as builder
ARG CACHEBUST=1
WORKDIR /app
COPY dist/apps/trac-web /app/
COPY package.json /app/
COPY config/init_nginx.sh /app/
RUN chmod 755 /app/init_nginx.sh
RUN npm install --legacy-peer-deps

FROM nginx:latest
# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html
# Remove default nginx static assets
RUN rm -rf ./*
COPY --from=builder /app .
#COPY config/nginx.conf /etc/nginx/conf.d/default.conf
ENTRYPOINT ["./init_nginx.sh"]

