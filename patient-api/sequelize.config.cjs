// sequelize.config.cjs
module.exports = {
  development: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: { 
      ssl: false // No SSL for development
    },
    logging: false,
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: { 
      ssl: { 
        require: true, 
        rejectUnauthorized: false,
        ca: undefined,
        checkServerIdentity: () => undefined
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
        rejectUnauthorized: false,
        ca: undefined,
        checkServerIdentity: () => undefined
      }
    },
    logging: false,
  },
};
