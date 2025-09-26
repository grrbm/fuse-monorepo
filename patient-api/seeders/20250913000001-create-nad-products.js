'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, create the products
    const products = await queryInterface.bulkInsert('Product', [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'NAD+ IV Infusion',
        description: 'High-dose NAD+ delivered intravenously to replenish cellular energy, support DNA repair, and promote anti-aging benefits.',
        price: 350.00,
        activeIngredients: ['NAD+'],
        dosage: '500 mg per infusion',
        imageUrl: 'https://example.com/images/nad-iv.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'NAD+ Capsules',
        description: 'Daily supplement containing bioavailable NAD+ precursors to maintain energy and support healthy aging.',
        price: 79.00,
        activeIngredients: ['NAD+', 'Niacinamide'],
        dosage: '300 mg daily',
        imageUrl: 'https://example.com/images/nad-capsules.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'NAD+ Longevity Drip',
        description: 'Combination of NAD+ with B vitamins to enhance metabolism, reduce fatigue, and support nervous system health.',
        price: 400.00,
        activeIngredients: ['NAD+', 'Vitamin B12', 'Vitamin B6'],
        dosage: '750 mg NAD+ + B-complex per infusion',
        imageUrl: 'https://example.com/images/nad-b-complex.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'NAD+ Detox Booster',
        description: 'Powerful anti-aging and detox combination with NAD+ and glutathione to fight oxidative stress and restore cellular health.',
        price: 450.00,
        activeIngredients: ['NAD+', 'Glutathione'],
        dosage: '500 mg NAD+ + 2000 mg Glutathione per infusion',
        imageUrl: 'https://example.com/images/nad-glutathione.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'NAD+ Sublingual Spray',
        description: 'Fast-absorbing sublingual NAD+ spray to support daily energy, mood, and anti-aging.',
        price: 65.00,
        activeIngredients: ['NAD+'],
        dosage: '50 mg per spray, 2 sprays daily',
        imageUrl: 'https://example.com/images/nad-spray.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Get the Anti Aging NAD+ treatment ID
    const [treatment] = await queryInterface.sequelize.query(
      `SELECT id FROM "Treatment" WHERE name = 'Anti Aging NAD+' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!treatment) {
      throw new Error('Anti Aging NAD+ treatment not found. Please run the treatment seeder first.');
    }

    // Create associations between products and the NAD+ treatment
    const treatmentProducts = [
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        treatmentId: treatment.id,
        productId: '550e8400-e29b-41d4-a716-446655440001',
        dosage: '500 mg per infusion',
        numberOfDoses: 8,
        nextDose: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440002',
        treatmentId: treatment.id,
        productId: '550e8400-e29b-41d4-a716-446655440002',
        dosage: '300 mg daily',
        numberOfDoses: 30,
        nextDose: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440003',
        treatmentId: treatment.id,
        productId: '550e8400-e29b-41d4-a716-446655440003',
        dosage: '750 mg NAD+ + B-complex per infusion',
        numberOfDoses: 6,
        nextDose: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440004',
        treatmentId: treatment.id,
        productId: '550e8400-e29b-41d4-a716-446655440004',
        dosage: '500 mg NAD+ + 2000 mg Glutathione per infusion',
        numberOfDoses: 4,
        nextDose: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440005',
        treatmentId: treatment.id,
        productId: '550e8400-e29b-41d4-a716-446655440005',
        dosage: '50 mg per spray, 2 sprays daily',
        numberOfDoses: 60,
        nextDose: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('TreatmentProducts', treatmentProducts);

    console.log('✅ NAD+ products and treatment associations created successfully');
  },

  async down(queryInterface, Sequelize) {
    // Remove treatment-product associations first
    await queryInterface.bulkDelete('TreatmentProducts', {
      productId: [
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440003',
        '550e8400-e29b-41d4-a716-446655440004',
        '550e8400-e29b-41d4-a716-446655440005'
      ]
    });

    // Remove the products
    await queryInterface.bulkDelete('Product', {
      id: [
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440003',
        '550e8400-e29b-41d4-a716-446655440004',
        '550e8400-e29b-41d4-a716-446655440005'
      ]
    });

    console.log('✅ NAD+ products seeder rolled back successfully');
  }
};