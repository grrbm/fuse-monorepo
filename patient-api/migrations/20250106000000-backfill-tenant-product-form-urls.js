'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Starting migration: Backfill TenantProductForm publishedUrl fields...');

    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Get all TenantProductForm records that don't have a publishedUrl
      const [tenantProductForms] = await queryInterface.sequelize.query(
        `
        SELECT 
          tpf.id,
          tpf."productId",
          tpf."clinicId",
          p.slug as "productSlug",
          p.name as "productName",
          c.slug as "clinicSlug"
        FROM "TenantProductForms" tpf
        LEFT JOIN "Products" p ON tpf."productId" = p.id
        LEFT JOIN "Clinics" c ON tpf."clinicId" = c.id
        WHERE tpf."publishedUrl" IS NULL
          AND tpf."deletedAt" IS NULL
          AND p.id IS NOT NULL
          AND c.id IS NOT NULL
        `,
        { transaction }
      );

      console.log(`📊 Found ${tenantProductForms.length} TenantProductForm records to update`);

      if (tenantProductForms.length === 0) {
        console.log('✅ No records need updating. Migration complete.');
        await transaction.commit();
        return;
      }

      // Determine environment
      const isProduction = process.env.NODE_ENV === 'production';
      const domain = isProduction ? 'fuse.health' : 'localhost:3000';
      const protocol = isProduction ? 'https' : 'http';

      let updated = 0;
      let skipped = 0;

      for (const form of tenantProductForms) {
        if (!form.productSlug) {
          // Product has no slug - generate one from name
          const productSlug = form.productName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          
          const timestamp = Date.now();
          const finalSlug = productSlug ? `${productSlug}-${timestamp}` : `product-${timestamp}`;

          // Update the product with the generated slug
          await queryInterface.sequelize.query(
            `UPDATE "Products" SET slug = :slug WHERE id = :productId`,
            {
              replacements: { slug: finalSlug, productId: form.productId },
              transaction
            }
          );

          form.productSlug = finalSlug;
          console.log(`  📝 Generated slug for product: ${form.productName} → ${finalSlug}`);
        }

        if (!form.clinicSlug) {
          console.log(`  ⚠️  Skipping form ${form.id}: Clinic has no slug`);
          skipped++;
          continue;
        }

        // Generate publishedUrl
        const publishedUrl = `${protocol}://${form.clinicSlug}.${domain}/my-products/${form.productSlug}/${form.id}`;

        // Update the TenantProductForm
        await queryInterface.sequelize.query(
          `
          UPDATE "TenantProductForms" 
          SET 
            "publishedUrl" = :publishedUrl,
            "lastPublishedAt" = COALESCE("lastPublishedAt", NOW()),
            "updatedAt" = NOW()
          WHERE id = :id
          `,
          {
            replacements: { publishedUrl, id: form.id },
            transaction
          }
        );

        updated++;
        console.log(`  ✅ Updated form ${form.id}: ${publishedUrl}`);
      }

      await transaction.commit();

      console.log('\n📊 Migration Summary:');
      console.log(`  ✅ Updated: ${updated} records`);
      console.log(`  ⚠️  Skipped: ${skipped} records`);
      console.log('✨ Migration complete!');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Reverting migration: Clearing TenantProductForm publishedUrl fields...');

    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.sequelize.query(
        `
        UPDATE "TenantProductForms" 
        SET 
          "publishedUrl" = NULL,
          "updatedAt" = NOW()
        WHERE "publishedUrl" IS NOT NULL
        `,
        { transaction }
      );

      await transaction.commit();
      console.log('✅ Rollback complete');

    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};

