import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
	type: 'content',
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
