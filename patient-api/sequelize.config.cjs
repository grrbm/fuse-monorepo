// sequelize.config.cjs
// HIPAA Compliance: Use AWS RDS CA certificate for proper TLS verification
const fs = require('fs');
const path = require('path');

// Load AWS RDS CA certificate bundle if available
const rdsCaCertPath = path.join(__dirname, 'src/certs/rds-ca-bundle.pem');
let rdsCaCert = undefined;

try {
  if (fs.existsSync(rdsCaCertPath)) {
    rdsCaCert = fs.readFileSync(rdsCaCertPath, 'utf8');
    console.log('✅ Migrations: AWS RDS CA certificate loaded');
  }
} catch (e) {
  console.warn('⚠️  Migrations: RDS CA certificate not loaded');
}

module.exports = {
  development: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: { 
      ssl: false // No SSL for development (local)
    },
    logging: false,
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: { 
      ssl: { 
        require: true, 
        rejectUnauthorized: !!rdsCaCert, // Verify certificate if CA bundle is available
        ca: rdsCaCert, // AWS RDS CA certificate bundle
      }
    },
    logging: false,
  },
  test: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: { 
      ssl: { 
        require: true, 
        rejectUnauthorized: !!rdsCaCert,
        ca: rdsCaCert,
      }
    },
    logging: false,
  },
};
