module.exports = {
  apps: [
    {
      name: 'bks-server',
      script: 'server/server.js',
      instances: 'max', // Utilizes all available CPU cores on Hostinger
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      }
    }
  ]
};
