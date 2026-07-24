module.exports = {
  apps: [{
    name: "mfs-api",
    script: "./src/server.js",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
    },
    env_file: ".env",
    max_restarts: 10,
    restart_delay: 5000,
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    error_file: "/var/log/mfs/api-error.log",
    out_file: "/var/log/mfs/api-out.log",
    merge_logs: true,
  }],
};
