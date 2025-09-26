'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // First, let's check if g-health clinic exists, if not create it
    const [clinics] = await queryInterface.sequelize.query(`
      SELECT id FROM "Clinic" WHERE slug = 'g-health'
    `);
    
    let gHealthClinicId;
    if (clinics.length === 0) {
      // Create g-health clinic if it doesn't exist
      const clinicId = require('uuid').v4();
      await queryInterface.bulkInsert('Clinic', [{
        id: clinicId,
        slug: 'g-health',
        name: 'G-Health Medical Center',
        logo: 'https://img.heroui.chat/image/clinic?w=200&h=200&u=g-health',
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
      gHealthClinicId = clinicId;
    } else {
      gHealthClinicId = clinics[0].id;
    }

    // Get a sample user ID (assuming there's at least one user)
    const [users] = await queryInterface.sequelize.query(`
      SELECT id FROM "users" LIMIT 1
    `);
    
    if (users.length === 0) {
      throw new Error('No users found. Please ensure users exist before seeding treatments.');
    }
    
    const userId = users[0].id;

    // Create treatments
    const treatments = [
      {
        id: require('uuid').v4(),
        name: 'Anti Aging NAD+',
        userId: userId,
        clinicId: gHealthClinicId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('uuid').v4(),
        name: 'Anti Aging Glutathione',
        userId: userId,
        clinicId: gHealthClinicId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('uuid').v4(),
        name: 'Vitamin Boost D3 + K2',
        userId: userId,
        clinicId: gHealthClinicId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('uuid').v4(),
        name: 'Immune Support',
        userId: userId,
        clinicId: gHealthClinicId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: require('uuid').v4(),
        name: 'Energy Enhancement',
        userId: userId,
        clinicId: gHealthClinicId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Treatment', treatments);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Treatment', null, {});
    // Optionally remove the clinic if it was created by this seeder
    await queryInterface.bulkDelete('Clinic', { slug: 'g-health' }, {});
  }
};