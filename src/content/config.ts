import { defineCollection, z } from 'astro:content';

const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  cover: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

// 中英分两个 collection，同 slug 互为双语对应
const blog = defineCollection({ type: 'content', schema: postSchema });
const blogEn = defineCollection({ type: 'content', schema: postSchema });

export const collections = { blog, 'blog-en': blogEn };
