/**
 * Template Variables Utility
 * 
 * Replaces placeholder variables in form templates with actual tenant data
 * 
 * Usage:
 * const text = "Welcome to {{companyName}}!"
 * const replaced = replaceVariables(text, { companyName: "FUSE Health" })
 * // Result: "Welcome to FUSE Health!"
 */

export interface TemplateVariables {
  companyName?: string
  clinicName?: string
  patientName?: string
  [key: string]: string | undefined
}

/**
 * Replace template variables in a string
 * Supports syntax: {{variableName}}
 */
export function replaceVariables(
  text: string,
  variables: TemplateVariables
): string {
  if (typeof text !== 'string' || text.length === 0) return typeof text === 'string' ? text : ''

  let result = text

  // Replace each variable
  Object.keys(variables).forEach((key) => {
    const value = variables[key]
    if (value !== undefined) {
      // Replace all occurrences of {{key}} with the value
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
      result = result.replace(regex, String(value))
    }
  })

  return result
}

/**
 * Replace variables in a questionnaire schema
 * Recursively processes all steps and questions
 */
export function replaceVariablesInSchema(
  schema: any,
  variables: TemplateVariables
): any {
  if (!schema) return schema

  // Clone the schema to avoid mutations
  const processedSchema = JSON.parse(JSON.stringify(schema))

  // Process steps
  if (processedSchema.steps && Array.isArray(processedSchema.steps)) {
    processedSchema.steps = processedSchema.steps.map((step: any) => ({
      ...step,
      title: replaceVariables(step.title || '', variables),
      description: replaceVariables(step.description || '', variables),
      questions: step.questions?.map((question: any) => ({
        ...question,
        questionText: replaceVariables(question.questionText || '', variables),
        options: question.options?.map((option: string) =>
          replaceVariables(option, variables)
        ),
      })),
    }))
  }

  return processedSchema
}

/**
 * Get variables from clinic/tenant data
 * Helper to extract variables from your clinic object
 */
export function getVariablesFromClinic(clinic: {
  name?: string
  organization?: string
  [key: string]: any
}): TemplateVariables {
  return {
    companyName: clinic.name || clinic.organization || 'FUSE Health',
    clinicName: clinic.name || clinic.organization || 'FUSE Health',
  }
}

