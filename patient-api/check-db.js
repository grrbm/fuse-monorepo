const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../.env.local' });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: false,
  dialectOptions: { ssl: false }
});

async function check() {
  try {
    const [results] = await sequelize.query(
      `SELECT id, title, "conditionalLogic", "isDeadEnd" FROM "QuestionnaireStep" WHERE id = '61824cff-da71-4000-97c4-3b5f25025c32'`
    );
    console.log('Database query result:');
    console.log(JSON.stringify(results, null, 2));
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
