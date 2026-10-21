const mongoose = require('mongoose');

exports.checkHealth = async (req, res) => {
  const startTime = Date.now();
  let dbStatus = 'DISCONNECTED';
  let latencyMs = 0;

  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      dbStatus = 'CONNECTED';
      latencyMs = Date.now() - startTime;
    }
  } catch (error) {
    dbStatus = 'ERROR';
  }

  const memoryUsage = process.memoryUsage();
  const toMB = (bytes) => Math.round((bytes / 1024 / 1024) * 100) / 100;

  const isHealthy = dbStatus === 'CONNECTED';

  return res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'UP' : 'DOWN',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'unknown',
      latencyMs: latencyMs
    },
    system: {
      memoryUsageMB: {
        rss: toMB(memoryUsage.rss),
        heapTotal: toMB(memoryUsage.heapTotal),
        heapUsed: toMB(memoryUsage.heapUsed)
      },
      nodeVersion: process.version
    }
  });
};
