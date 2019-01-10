const PROXY_CONFIG = {
  "/pp": {
    "target": {
      "host": "localhost",
      "protocol": "https:",
      "port": 5443
    },
    "ws": true,
    "secure": false,
    "changeOrigin": true,
  }
}

module.exports = PROXY_CONFIG;
