'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Update the supercheap plan to allow 25 products
    await queryInterface.sequelize.query(`
      UPDATE "BrandSubscriptionPlans"
      SET "maxProducts" = 25,
          "updatedAt" = NOW()
      WHERE "planType" = 'supercheap';
    `);

    console.log('✅ Updated supercheap plan maxProducts to 25');

    // Update existing active subscriptions with supercheap plan to have maxProducts: 25 in their features
    const [subscriptions] = await queryInterface.sequelize.query(`
      SELECT id, features
      FROM "BrandSubscription"
      WHERE "planType" = 'supercheap'
        AND status = 'active'
        AND "deletedAt" IS NULL;
    `);

    console.log(`Found ${subscriptions.length} active supercheap subscriptions to update`);

    for (const subscription of subscriptions) {
      let features = subscription.features || {};
      
      // Parse features if it's a string
      if (typeof features === 'string') {
        try {
          features = JSON.parse(features);
        } catch (e) {
          features = {};
        }
      }

      // Update maxProducts in features
      features.maxProducts = 25;

      await queryInterface.sequelize.query(`
        UPDATE "BrandSubscription"
        SET features = :features,
            "updatedAt" = NOW()
        WHERE id = :id;
      `, {
        replacements: {
          features: JSON.stringify(features),
          id: subscription.id
        }
      });
    }

    console.log('✅ Updated all active supercheap subscriptions');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert back to 3 products if needed
    await queryInterface.sequelize.query(`
      UPDATE "BrandSubscriptionPlans"
      SET "maxProducts" = 3,
          "updatedAt" = NOW()
      WHERE "planType" = 'supercheap';
    `);

    console.log('✅ Reverted supercheap plan maxProducts to 3');

    // Revert existing active subscriptions
    const [subscriptions] = await queryInterface.sequelize.query(`
      SELECT id, features
      FROM "BrandSubscription"
      WHERE "planType" = 'supercheap'
        AND status = 'active'
        AND "deletedAt" IS NULL;
    `);

    for (const subscription of subscriptions) {
      let features = subscription.features || {};
      
      if (typeof features === 'string') {
        try {
          features = JSON.parse(features);
        } catch (e) {
          features = {};
        }
      }

      features.maxProducts = 3;

      await queryInterface.sequelize.query(`
        UPDATE "BrandSubscription"
        SET features = :features,
            "updatedAt" = NOW()
        WHERE id = :id;
      `, {
        replacements: {
          features: JSON.stringify(features),
          id: subscription.id
        }
      });
    }

    console.log('✅ Reverted all active supercheap subscriptions');
  }
};

