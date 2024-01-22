const path = require("path");
const {containerName} = require("./settings");
fs = require('fs-extra');

const contentsFn = (mainPort, apiPort, apiHost, certFile, certKeyFile) => `
map $http_upgrade $connection_upgrade {
  default upgrade;
  ''      close;
}
server {
  listen ${mainPort} ssl;
  ssl_certificate /tmp/certs/${certFile};
  ssl_certificate_key /tmp/certs/${certKeyFile};
  underscores_in_headers on;
  keepalive_timeout 2h;
  client_max_body_size 0;
  #   ssl_session_reuse on;
  # add_header Access-Control-Allow-Origin *;

  location / {
    root   /usr/share/nginx/html;
    index  index.html index.htm;
    try_files $uri $uri/ /index.html =404;
  }
  location /api/ {
    proxy_pass http://${apiHost}:${apiPort}/api/;
    proxy_buffering  off;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-NginX-Proxy true;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_read_timeout 2h;
    proxy_send_timeout 2h;
  }
}
`
const GenerateNginx = class {
  constructor(container, mainPort, apiPort, certFile, certKeyFile) {
    this.container = container;
    this.mainPort = mainPort;
    this.apiPort = apiPort;
    this.certFile = certFile;
    this.certKeyFile = certKeyFile;
  }

  async generate(configDir, isProduction = false) {
    const filePath = path.join(configDir, 'nginx.conf');
    await fs.writeFile(filePath, contentsFn(this.mainPort, this.apiPort,
      containerName(this.container, isProduction),
      this.certFile, this.certKeyFile));
  }
}
module.exports = GenerateNginx;
