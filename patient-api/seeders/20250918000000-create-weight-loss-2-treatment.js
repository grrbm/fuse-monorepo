'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // First, let's check if saboia.xyz clinic exists, if not create it
    const [clinics] = await queryInterface.sequelize.query(`
      SELECT id FROM "Clinic" WHERE slug = 'saboia.xyz'
    `);
    
    let saboiaClinicId;
    if (clinics.length === 0) {
      // Create saboia.xyz clinic if it doesn't exist
      const clinicId = require('uuid').v4();
      await queryInterface.bulkInsert('Clinic', [{
        id: clinicId,
        slug: 'saboia.xyz',
        name: 'Saboia.XYZ',
        logo: 'https://img.heroui.chat/image/clinic?w=200&h=200&u=saboia.xyz',
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
      saboiaClinicId = clinicId;
    } else {
      saboiaClinicId = clinics[0].id;
    }

    // Get a sample user ID (assuming there's at least one user)
    const [users] = await queryInterface.sequelize.query(`
      SELECT id FROM "users" LIMIT 1
    `);
    
    if (users.length === 0) {
      throw new Error('No users found. Please ensure users exist before seeding treatments.');
    }
    
    const userId = users[0].id;

    // Create Weight Loss 2 treatment
    const weightLoss2TreatmentId = require('uuid').v4();
    await queryInterface.bulkInsert('Treatment', [{
      id: weightLoss2TreatmentId,
      name: 'Weight Loss 2',
      userId: userId,
      clinicId: saboiaClinicId,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    console.log('✅ Weight Loss 2 treatment created successfully');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Treatment', { name: 'Weight Loss 2' }, {});
  }
};