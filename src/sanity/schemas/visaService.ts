import { defineType, defineField, defineArrayMember } from 'sanity'

export const visaServiceSchema = defineType({
  name: 'visaService',
  title: 'Visa Service',
  type: 'document',
  fields: [
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'flag',
      title: 'Flag Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'processingTime',
      title: 'Processing Time',
      type: 'string',
      description: 'e.g. "5–10 business days"',
    }),
    defineField({
      name: 'priceNaira',
      title: 'Service Price (₦)',
      type: 'number',
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: 'requirements',
      title: 'Document Requirements',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'successRate',
      title: 'Success Rate (%)',
      type: 'number',
      validation: (r) => r.min(0).max(100),
      description: 'e.g. 98 for 98%',
    }),
    defineField({
      name: 'active',
      title: 'Active (visible on site)',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'country',
      subtitle: 'processingTime',
      media: 'flag',
    },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: subtitle ? `⏱ ${subtitle}` : undefined, media }
    },
  },
  orderings: [
    { title: 'Country A–Z', name: 'countryAsc', by: [{ field: 'country', direction: 'asc' }] },
  ],
})
