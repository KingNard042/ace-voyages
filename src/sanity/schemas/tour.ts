import { defineType, defineField, defineArrayMember } from 'sanity'

export const tourSchema = defineType({
  name: 'tour',
  title: 'Tour',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Tour Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'destination',
      title: 'Destination',
      type: 'object',
      fields: [
        defineField({
          name: 'city',
          title: 'City',
          type: 'string',
          validation: (r) => r.required(),
        }),
        defineField({
          name: 'country',
          title: 'Country',
          type: 'string',
          validation: (r) => r.required(),
        }),
      ],
    }),
    defineField({
      name: 'price',
      title: 'Price (₦)',
      type: 'number',
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: 'duration',
      title: 'Duration (days)',
      type: 'number',
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'groupSize',
      title: 'Max Group Size',
      type: 'number',
      validation: (r) => r.min(1),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
    }),
    defineField({
      name: 'whatsIncluded',
      title: "What's Included",
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'highlights',
      title: 'Highlights',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'active',
      title: 'Active (visible on site)',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Leisure', value: 'leisure' },
          { title: 'Honeymoon', value: 'honeymoon' },
          { title: 'Corporate', value: 'corporate' },
          { title: 'Adventure', value: 'adventure' },
        ],
        layout: 'radio',
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'destination.city',
      media: 'heroImage',
    },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: subtitle ? `📍 ${subtitle}` : 'No destination', media }
    },
  },
  orderings: [
    { title: 'Featured First', name: 'featuredDesc', by: [{ field: 'featured', direction: 'desc' }] },
    { title: 'Price: Low to High', name: 'priceAsc', by: [{ field: 'price', direction: 'asc' }] },
  ],
})
