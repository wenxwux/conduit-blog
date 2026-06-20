import { getCollection } from 'astro:content';
import { LOCALES, type LocaleCode } from './config';

// 给定 slug，返回真实存在该篇译文的语言列表（用于存在性感知 hreflang）。
// 在 [...slug].astro 的 getStaticPaths 内调用。
export async function availableLocalesFor(slug: string): Promise<LocaleCode[]> {
  const sets = await Promise.all(
    LOCALES.map(async (l) => {
      const posts = await getCollection(l.collection, ({ data }) => !data.draft);
      return posts.some((p) => p.slug === slug) ? l.code : null;
    })
  );
  return sets.filter((c): c is LocaleCode => c !== null);
}
