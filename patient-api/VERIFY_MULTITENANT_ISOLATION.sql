-- Verify Multi-Tenant Isolation for TenantProductForms
-- This script shows that each clinic only sees their own forms

-- Show all forms grouped by clinic
SELECT 
    c.slug as clinic_slug,
    c.name as clinic_name,
    p.name as product_name,
    tpf."currentFormVariant",
    COUNT(*) as form_count
FROM "TenantProductForms" tpf
LEFT JOIN "Clinic" c ON c.id = tpf."clinicId"
LEFT JOIN "Product" p ON p.id = tpf."productId"
GROUP BY c.slug, c.name, p.name, tpf."currentFormVariant"
ORDER BY c.slug, p.name, tpf."currentFormVariant" NULLS FIRST;

-- Show detailed breakdown by clinic and product
SELECT 
    c.slug as clinic,
    p.name as product,
    u.email as tenant_user,
    tpf."currentFormVariant" as variant,
    tpf."publishedUrl"
FROM "TenantProductForms" tpf
LEFT JOIN "Clinic" c ON c.id = tpf."clinicId"
LEFT JOIN "Product" p ON p.id = tpf."productId"
LEFT JOIN users u ON u.id = tpf."tenantId"
ORDER BY c.slug, p.name, tpf."currentFormVariant" NULLS FIRST;

-- Verify no cross-clinic contamination
-- This should return 0 rows if isolation is working correctly
SELECT 
    'ISOLATION VIOLATION' as issue,
    tpf.id,
    t_clinic.slug as tenant_clinic,
    form_clinic.slug as form_clinic
FROM "TenantProductForms" tpf
LEFT JOIN users u ON u.id = tpf."tenantId"
LEFT JOIN "Clinic" t_clinic ON t_clinic.id = u."clinicId"
LEFT JOIN "Clinic" form_clinic ON form_clinic.id = tpf."clinicId"
WHERE u."clinicId" != tpf."clinicId";

