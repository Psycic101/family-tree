import 'dotenv/config';

interface Config {
  db: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  sessionSecret: string;
  jwtSecret: string;
  host: string;
  port: number;
  nodeEnv: 'development' | 'production';
}

function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}

const config: Config = {
  db: {
    host: getEnvVar('DB_HOST', 'localhost'),
    port: parseInt(getEnvVar('DB_PORT', '5432')),
    name: getEnvVar('DB_NAME', 'myapp'),
    user: getEnvVar('DB_USER', 'postgres'),
    password: getEnvVar('DB_PASSWORD', 'mypassword'),
  },
  sessionSecret: getEnvVar('SESSION_SECRET', 'dev-secret-change-in-prod'),
  jwtSecret: getEnvVar('JWT_SECRET', 'dev-jwt-secret-change-in-prod'),
  host: getEnvVar('HOST', 'localhost'),
  port: parseInt(getEnvVar('PORT', '3001')),
  nodeEnv: (process.env.NODE_ENV as Config['nodeEnv']) || 'development',
};

export default config;