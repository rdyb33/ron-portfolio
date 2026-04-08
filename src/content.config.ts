import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
	loader: glob({ pattern: '**/[^_]*.{md,mdoc}', base: './src/content/projects' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		image: z.string(),
		tags: z.array(z.string()),
	}),
});

export const collections = {
	projects,
};
