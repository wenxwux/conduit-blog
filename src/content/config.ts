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

// 五语各一个 collection，同 slug 互为译文对应
const blog = defineCollection({ type: 'content', schema: postSchema });
const blogEn = defineCollection({ type: 'content', schema: postSchema });
const blogJa = defineCollection({ type: 'content', schema: postSchema });
const blogKo = defineCollection({ type: 'content', schema: postSchema });
const blogEs = defineCollection({ type: 'content', schema: postSchema });

export const collections = {
  blog,
  'blog-en': blogEn,
  'blog-ja': blogJa,
  'blog-ko': blogKo,
  'blog-es': blogEs,
};
