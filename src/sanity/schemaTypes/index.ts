import { type SchemaTypeDefinition } from 'sanity'
import { tourSchema } from '../schemas/tour'
import { blogPostSchema } from '../schemas/blogPost'
import { testimonialSchema } from '../schemas/testimonial'
import { visaServiceSchema } from '../schemas/visaService'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [tourSchema, blogPostSchema, testimonialSchema, visaServiceSchema],
}
