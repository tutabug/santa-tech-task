import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10),
  logLevel: process.env.LOG_LEVEL,
  uploadDir: process.env.UPLOAD_DIR,
}));
