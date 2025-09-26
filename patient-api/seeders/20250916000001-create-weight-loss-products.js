'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, create the weight loss products
    const products = await queryInterface.bulkInsert('Product', [
      {
        id: '550e8400-e29b-41d4-a716-446655440101',
        name: 'Ozempic (Semaglutide Injection)',
        description: 'A GLP-1 receptor agonist that helps regulate appetite and blood sugar, promoting weight loss and improving metabolic health.',
        price: 900.00,
        activeIngredients: ['Semaglutide'],
        dosage: '0.25–2 mg subcutaneous injection weekly',
        imageUrl: 'https://example.com/images/ozempic.jpg',
        createdAt: new Date('2025-09-13T01:57:34.854Z'),
        updatedAt: new Date('2025-09-13T01:57:34.854Z')
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440102',
        name: 'Wegovy (Semaglutide Injection)',
        description: 'An FDA-approved higher-dose version of semaglutide designed specifically for chronic weight management.',
        price: 1100.00,
        activeIngredients: ['Semaglutide'],
        dosage: '2.4 mg subcutaneous injection weekly',
        imageUrl: 'https://example.com/images/wegovy.jpg',
        createdAt: new Date('2025-09-13T01:57:34.854Z'),
        updatedAt: new Date('2025-09-13T01:57:34.854Z')
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440103',
        name: 'Mounjaro (Tirzepatide Injection)',
        description: 'A dual GIP and GLP-1 receptor agonist that enhances weight loss and improves insulin sensitivity for type 2 diabetes and obesity.',
        price: 1200.00,
        activeIngredients: ['Tirzepatide'],
        dosage: '2.5–15 mg subcutaneous injection weekly',
        imageUrl: 'https://example.com/images/mounjaro.jpg',
        createdAt: new Date('2025-09-13T01:57:34.854Z'),
        updatedAt: new Date('2025-09-13T01:57:34.854Z')
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440104',
        name: 'Saxenda (Liraglutide Injection)',
        description: 'A daily GLP-1 receptor agonist injection that reduces appetite and helps with sustained weight loss.',
        price: 850.00,
        activeIngredients: ['Liraglutide'],
        dosage: '3 mg subcutaneous injection daily',
        imageUrl: 'https://example.com/images/saxenda.jpg',
        createdAt: new Date('2025-09-13T01:57:34.854Z'),
        updatedAt: new Date('2025-09-13T01:57:34.854Z')
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440105',
        name: 'Contrave (Naltrexone/Bupropion Tablets)',
        description: 'An oral medication combining an opioid antagonist and an antidepressant to reduce food cravings and regulate appetite.',
        price: 450.00,
        activeIngredients: ['Naltrexone', 'Bupropion'],
        dosage: '32 mg Naltrexone + 360 mg Bupropion daily (divided doses)',
        imageUrl: 'https://example.com/images/contrave.jpg',
        createdAt: new Date('2025-09-13T01:57:34.854Z'),
        updatedAt: new Date('2025-09-13T01:57:34.854Z')
      }
    ], { returning: true });

    // Get the Weight Loss treatment ID
    const [treatment] = await queryInterface.sequelize.query(
      `SELECT id FROM "Treatment" WHERE name = 'Weight Loss' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!treatment) {
      throw new Error('Weight Loss treatment not found. Please run the treatment seeder first.');
    }

    // Create associations between products and the Weight Loss treatment
    const treatmentProducts = [
      {
        id: '660e8400-e29b-41d4-a716-446655440101',
        treatmentId: treatment.id,
        productId: '550e8400-e29b-41d4-a716-446655440101',
        dosage: '0.25–2 mg subcutaneous injection weekly',
        numberOfDoses: 4,
        nextDose: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440102',
        treatmentId: treatment.id,
        productId: '550e8400-e29b-41d4-a716-446655440102',
        dosage: '2.4 mg subcutaneous injection weekly',
        numberOfDoses: 4,
        nextDose: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440103',
        treatmentId: treatment.id,
        productId: '550e8400-e29b-41d4-a716-446655440103',
        dosage: '2.5–15 mg subcutaneous injection weekly',
        numberOfDoses: 4,
        nextDose: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440104',
        treatmentId: treatment.id,
        productId: '550e8400-e29b-41d4-a716-446655440104',
        dosage: '3 mg subcutaneous injection daily',
        numberOfDoses: 30,
        nextDose: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440105',
        treatmentId: treatment.id,
        productId: '550e8400-e29b-41d4-a716-446655440105',
        dosage: '32 mg Naltrexone + 360 mg Bupropion daily (divided doses)',
        numberOfDoses: 30,
        nextDose: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('TreatmentProducts', treatmentProducts);

    console.log('✅ Weight Loss products and treatment associations created successfully');
  },

  async down(queryInterface, Sequelize) {
    // Remove treatment-product associations first
    await queryInterface.bulkDelete('TreatmentProducts', {
      productId: [
        '550e8400-e29b-41d4-a716-446655440101',
        '550e8400-e29b-41d4-a716-446655440102',
        '550e8400-e29b-41d4-a716-446655440103',
        '550e8400-e29b-41d4-a716-446655440104',
        '550e8400-e29b-41d4-a716-446655440105'
      ]
    });

    // Remove the products
    await queryInterface.bulkDelete('Product', {
      id: [
        '550e8400-e29b-41d4-a716-446655440101',
        '550e8400-e29b-41d4-a716-446655440102',
        '550e8400-e29b-41d4-a716-446655440103',
        '550e8400-e29b-41d4-a716-446655440104',
        '550e8400-e29b-41d4-a716-446655440105'
      ]
    });

    console.log('✅ Weight Loss products seeder rolled back successfully');
  }
};