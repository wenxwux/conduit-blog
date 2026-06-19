# conduit-blog

Conduit AI 的中英双语 AI 教程博客（GitHub Pages 主站）。Astro 静态站。

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321/conduit-blog/
npm run build    # 产物在 dist/
npm run preview
```

## 结构

- `src/content/blog/` 中文文章（Markdown）｜`src/content/blog-en/` 英文文章
- 同 slug 对应同篇双语，语言切换按钮直接跳对应 slug
- `src/components/SoftCTA.astro` —— **「10% 平台」文案唯一来源**，改口径/查红线只看这里
- `src/layouts/BaseLayout.astro` —— SEO meta / OG / Twitter Card / JSON-LD / hreflang
- `public/robots.txt`、`public/llms.txt`（GEO）、favicon.svg

## 部署到 GitHub Pages

1. 新建空仓 `conduit-blog`，推送本目录。
2. 仓库 Settings → Pages → Source 选 **GitHub Actions**。
3. 推 main 自动触发 `.github/workflows/deploy.yml` 构建并发布。
4. 访问 `https://wenxwux.github.io/conduit-blog/`

## 绑自定义域名（将来）

1. 改 `astro.config.mjs`：`SITE` 改成你的域名，删掉 `base: BASE` 那一行（或设为 `/`）。
2. `public/` 下新建 `CNAME` 文件，内容写你的域名（如 `blog.example.com`）。
3. 在域名 DNS 加 CNAME 记录指向 `wenxwux.github.io`。
4. 改 `public/robots.txt` 里的 sitemap 地址为新域。

## 合规

全站内容遵守 STRATEGY.md §6：中文内容无翻墙/中转站等红线词；平台引导集中在 SoftCTA 组件，中文软表达、英文可直接品牌。
