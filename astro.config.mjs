import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 部署：先用 GitHub Pages 项目页子路径，域名后绑只改 SITE + 删 base + 加 public/CNAME
const SITE = 'https://wenxwux.github.io';
const BASE = '/conduit-blog';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  // 双语用手动路由实现：中文走根 /，英文走 /en/（见 src/pages/en/）。
  // hreflang 在 BaseLayout 中按 altSlug 输出，无需 Astro i18n 集成。
});
