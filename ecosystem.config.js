module.exports = {
  apps: [
    {
      name: 'smart-scraper',
      script: './server/server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        HOST: '0.0.0.0'
      },
      // Configure timeouts and worker settings
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      time: true,
      // Add additional options to optimize for Render environment
      node_args: [
        '--max-old-space-size=512',
        '--max-http-header-size=16384'
      ],
      exp_backoff_restart_delay: 100
    }
  ]
}; 