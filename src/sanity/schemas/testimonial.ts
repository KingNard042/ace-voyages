import { defineType, defineField } from 'sanity'

export const testimonialSchema = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'city',
      title: 'City',
      type: 'string',
    }),
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'text',
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'starRating',
      title: 'Star Rating (1–5)',
      type: 'number',
      validation: (r) => r.required().min(1).max(5).integer(),
      initialValue: 5,
    }),
    defineField({
      name: 'tourBooked',
      title: 'Tour Booked',
      type: 'string',
    }),
    defineField({
      name: 'photo',
      title: 'Customer Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'approved',
      title: 'Approved (visible on site)',
      type: 'boolean',
      initialValue: false,
      description: 'Only approved testimonials appear on the website',
    }),
  ],
  preview: {
    select: {
      title: 'customerName',
      subtitle: 'city',
      media: 'photo',
    },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: subtitle ? `${subtitle}, Nigeria` : 'Nigeria', media }
    },
  },
})
