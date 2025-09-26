'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, create the weight loss products (reusing the same products from Weight Loss treatment)
    const products = await queryInterface.bulkInsert('Product', [
      {
        id: '550e8400-e29b-41d4-a716-446655440201',
        name: 'Compounded Semaglutide',
        description: 'Most commonly prescribed for consistent weight management. Same active ingredient as Ozempic®.',
        price: 299.00,
        activeIngredients: ['Semaglutide'],
        dosage: '0.25–2 mg subcutaneous injection weekly',
        imageUrl: 'https://example.com/images/compounded-semaglutide.jpg',
        createdAt: new Date('2025-09-18T01:57:34.854Z'),
        updatedAt: new Date('2025-09-18T01:57:34.854Z')
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440202',
        name: 'Compounded Tirzepatide',
        description: 'Dual GIP and GLP-1 receptor agonist for enhanced weight loss results.',
        price: 399.00,
        activeIngredients: ['Tirzepatide'],
        dosage: '2.5–15 mg subcutaneous injection weekly',
        imageUrl: 'https://example.com/images/compounded-tirzepatide.jpg',
        createdAt: new Date('2025-09-18T01:57:34.854Z'),
        updatedAt: new Date('2025-09-18T01:57:34.854Z')
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440203',
        name: 'Compounded Liraglutide',
        description: 'Daily GLP-1 receptor agonist for appetite control and sustained weight loss.',
        price: 250.00,
        activeIngredients: ['Liraglutide'],
        dosage: '3 mg subcutaneous injection daily',
        imageUrl: 'https://example.com/images/compounded-liraglutide.jpg',
        createdAt: new Date('2025-09-18T01:57:34.854Z'),
        updatedAt: new Date('2025-09-18T01:57:34.854Z')
      }
    ], { returning: true });

    // Get the Weight Loss 2 treatment ID
    const [treatment] = await queryInterface.sequelize.query(
      `SELECT id FROM "Treatment" WHERE name = 'Weight Loss 2' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!treatment) {
      throw new Error('Weight Loss 2 treatment not found. Please run the treatment seeder first.');
    }

    // Create associations between products and the Weight Loss 2 treatment
    const treatmentProducts = [
      {
        id: '660e8400-e29b-41d4-a716-446655440201',
        treatmentId: treatment.id,
        productId: '550e8400-e29b-41d4-a716-446655440201',
        dosage: '0.25–2 mg subcutaneous injection weekly',
        numberOfDoses: 4,
        nextDose: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440202',
        treatmentId: treatment.id,
        productId: '550e8400-e29b-41d4-a716-446655440202',
        dosage: '2.5–15 mg subcutaneous injection weekly',
        numberOfDoses: 4,
        nextDose: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440203',
        treatmentId: treatment.id,
        productId: '550e8400-e29b-41d4-a716-446655440203',
        dosage: '3 mg subcutaneous injection daily',
        numberOfDoses: 30,
        nextDose: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('TreatmentProducts', treatmentProducts);

    console.log('✅ Weight Loss 2 products and treatment associations created successfully');
  },

  async down(queryInterface, Sequelize) {
    // Remove treatment-product associations first
    await queryInterface.bulkDelete('TreatmentProducts', {
      productId: [
        '550e8400-e29b-41d4-a716-446655440201',
        '550e8400-e29b-41d4-a716-446655440202',
        '550e8400-e29b-41d4-a716-446655440203'
      ]
    });

    // Remove the products
    await queryInterface.bulkDelete('Product', {
      id: [
        '550e8400-e29b-41d4-a716-446655440201',
        '550e8400-e29b-41d4-a716-446655440202',
        '550e8400-e29b-41d4-a716-446655440203'
      ]
    });

    console.log('✅ Weight Loss 2 products seeder rolled back successfully');
  }
};