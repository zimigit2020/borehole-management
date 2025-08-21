const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://borehole-management-nuyvk.ondigitalocean.app/api',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api': ''  // Remove /api prefix when forwarding
      },
      headers: {
        'Origin': 'https://borehole-management-nuyvk.ondigitalocean.app'
      },
      onProxyReq: (proxyReq, req, res) => {
        // Log the proxied request
        console.log('Proxying:', req.method, req.url, '→', proxyReq.path);
      },
      onProxyRes: (proxyRes, req, res) => {
        // Add CORS headers to the response
        proxyRes.headers['access-control-allow-origin'] = 'http://localhost:3000';
        proxyRes.headers['access-control-allow-credentials'] = 'true';
      }
    })
  );
};