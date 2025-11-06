import FormSectionTemplate, { FormSectionType } from '../models/FormSectionTemplate'
import TenantProductForm from '../models/TenantProductForm'
import Treatment from '../models/Treatment'
import Product from '../models/Product'
import Questionnaire from '../models/Questionnaire'
import Clinic from '../models/Clinic'
import { sequelize } from '../config/database'

interface TemplateAssignmentInput {
  tenantId: string
  treatmentId: string
  personalizationTemplateId: string
  accountTemplateId: string
  doctorTemplateId: string
  layoutTemplate: string
  themeId?: string | null
  lockedUntil?: Date | null
}

const isProd = process.env.NODE_ENV === 'production'

const sanitizeSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

async function ensureProductSlug(product: Product): Promise<string> {
  if (product.slug) {
    return product.slug
  }

  const base = sanitizeSlug(product.name || 'product') || `product-${Date.now()}`
  let candidate = base
  let attempt = 1

  while (await Product.findOne({ where: { slug: candidate } })) {
    candidate = `${base}-${Date.now()}${attempt > 1 ? `-${attempt}` : ''}`
    attempt += 1
  }

  await product.update({ slug: candidate })
  return candidate
}

async function ensurePublishedUrl(form: TenantProductForm): Promise<void> {
  if (form.publishedUrl || !form.productId || !form.clinicId) {
    return
  }

  const product = (form as any).product as Product | undefined || await Product.findByPk(form.productId)
  const clinic = (form as any).clinic as Clinic | undefined || await Clinic.findByPk(form.clinicId)

  if (!product || !clinic || !clinic.slug) {
    return
  }

  const productSlug = await ensureProductSlug(product)
  const domain = isProd
    ? `${clinic.slug}.fuse.health`
    : `${clinic.slug}.localhost:3000`
  const protocol = isProd ? 'https' : 'http'
  const publishedUrl = `${protocol}://${domain}/my-products/${form.id}/${productSlug}`

  await form.update({
    publishedUrl,
    lastPublishedAt: form.lastPublishedAt ?? new Date(),
  } as any)
}

class FormTemplateService {
  async listTemplates(options?: { sectionType?: FormSectionType; category?: string | null; treatmentId?: string | null }) {
    const where: any = {
      isGlobal: true, // Only return global templates (master templates for all tenants)
    }

    if (options?.sectionType) {
      where.sectionType = options.sectionType
    }

    if (options?.category) {
      where.category = options.category
    }

    if (options?.treatmentId) {
      where.treatmentId = options.treatmentId
    }

    return FormSectionTemplate.findAll({
      where,
      order: [['sectionType', 'ASC'], ['category', 'ASC NULLS FIRST'], ['version', 'DESC']],
    })
  }

  async getTemplateById(id: string) {
    return FormSectionTemplate.findByPk(id)
  }

  async createTemplate(input: {
    name: string
    description?: string
    sectionType: FormSectionType
    category?: string
    schema?: Record<string, any>
    isGlobal?: boolean
    tenantId?: string
  }) {
    const template = await FormSectionTemplate.create({
      name: input.name,
      description: input.description,
      sectionType: input.sectionType,
      category: input.category,
      schema: input.schema || { steps: [] },
      version: 1,
      isActive: true,
      isGlobal: input.isGlobal || true, // Default to global
      tenantId: input.isGlobal ? null : input.tenantId, // Global templates have no tenant
    })

    return template
  }

  async updateTemplate(id: string, input: {
    name?: string
    description?: string
    schema?: Record<string, any>
  }) {
    const template = await FormSectionTemplate.findByPk(id)

    if (!template) {
      throw new Error('Template not found')
    }

    await template.update({
      name: input.name !== undefined ? input.name : template.name,
      description: input.description !== undefined ? input.description : template.description,
      schema: input.schema !== undefined ? input.schema : template.schema,
      version: template.version + 1, // Increment version on update
    })

    return template
  }

  async assignTemplates(input: TemplateAssignmentInput) {
    const transaction = await sequelize.transaction()

    try {
      const { tenantId, treatmentId, personalizationTemplateId, accountTemplateId, doctorTemplateId, layoutTemplate, themeId, lockedUntil } = input

      const treatment = await Treatment.findByPk(treatmentId)
      if (!treatment) {
        throw new Error('Treatment not found')
      }

      const [personalizationTemplate, accountTemplate, doctorTemplate] = await Promise.all([
        FormSectionTemplate.findByPk(personalizationTemplateId),
        FormSectionTemplate.findByPk(accountTemplateId),
        FormSectionTemplate.findByPk(doctorTemplateId),
      ])

      if (!personalizationTemplate || personalizationTemplate.sectionType !== 'personalization') {
        throw new Error('Invalid personalization template')
      }

      if (!accountTemplate || accountTemplate.sectionType !== 'account') {
        throw new Error('Invalid account template')
      }

      if (!doctorTemplate || doctorTemplate.sectionType !== 'doctor') {
        throw new Error('Invalid doctor template')
      }

      const [record] = await TenantProductForm.upsert(
        {
          tenantId,
          treatmentId,
          personalizationTemplateId,
          accountTemplateId,
          doctorTemplateId,
          layoutTemplate,
          themeId: themeId ?? null,
          lockedUntil: lockedUntil ?? null,
        },
        { returning: true, transaction }
      )

      const updated = await TenantProductForm.findByPk(record.id, {
        include: [
          { model: FormSectionTemplate, as: 'personalizationTemplate' },
          { model: FormSectionTemplate, as: 'accountTemplate' },
          { model: FormSectionTemplate, as: 'doctorTemplate' },
          { model: Treatment },
        ],
        transaction,
      })

      await transaction.commit()

      return updated ?? record
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }

  async getTenantProductForm(tenantId: string, treatmentId: string) {
    const form = await TenantProductForm.findOne({
      where: { tenantId, treatmentId },
      include: [
        { model: Treatment },
        { model: Product },
        { model: Questionnaire },
        { model: Clinic },
      ],
    })

    if (form) {
      await ensurePublishedUrl(form)
    }

    return form
  }

  async listTenantProductForms(tenantId: string) {
    const forms = await TenantProductForm.findAll({
      where: { tenantId },
      include: [
        { model: Treatment },
        { model: Product },
        { model: Questionnaire },
        { model: Clinic },
      ],
      order: [['createdAt', 'DESC']],
    })

    for (const form of forms) {
      await ensurePublishedUrl(form)
    }

    return forms
  }
}

export default new FormTemplateService()

