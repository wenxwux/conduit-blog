// 多语言单一事实源 —— 新增/调整语言、改 UI 文案、查口径只看这里。
// 五语：zh 走根 /，其余加前缀 /en /ja /ko /es。

export type LocaleCode = 'zh' | 'en' | 'ja' | 'ko' | 'es';

export interface LocaleMeta {
  code: LocaleCode;
  htmlLang: string;        // <html lang>
  ogLocale: string;        // og:locale
  dateLocale: string;      // toLocaleDateString 用
  label: string;           // 语言切换器显示名
  dir: 'ltr' | 'rtl';
  urlPrefix: string;       // '' | '/en' | '/ja' | ...
  collection: 'blog' | 'blog-en' | 'blog-ja' | 'blog-ko' | 'blog-es';
}

export const LOCALES: LocaleMeta[] = [
  { code: 'zh', htmlLang: 'zh-CN', ogLocale: 'zh_CN', dateLocale: 'zh-CN', label: '中文',    dir: 'ltr', urlPrefix: '',    collection: 'blog'    },
  { code: 'en', htmlLang: 'en',    ogLocale: 'en_US', dateLocale: 'en-US', label: 'EN',      dir: 'ltr', urlPrefix: '/en', collection: 'blog-en' },
  { code: 'ja', htmlLang: 'ja',    ogLocale: 'ja_JP', dateLocale: 'ja-JP', label: '日本語',  dir: 'ltr', urlPrefix: '/ja', collection: 'blog-ja' },
  { code: 'ko', htmlLang: 'ko',    ogLocale: 'ko_KR', dateLocale: 'ko-KR', label: '한국어',  dir: 'ltr', urlPrefix: '/ko', collection: 'blog-ko' },
  { code: 'es', htmlLang: 'es',    ogLocale: 'es_ES', dateLocale: 'es-ES', label: 'Español', dir: 'ltr', urlPrefix: '/es', collection: 'blog-es' },
];

export const DEFAULT_LOCALE: LocaleCode = 'zh';
export const localeOf = (c: LocaleCode): LocaleMeta => LOCALES.find((l) => l.code === c)!;
export const HREFLANG: Record<LocaleCode, string> = { zh: 'zh-CN', en: 'en', ja: 'ja', ko: 'ko', es: 'es' };

// ---- UI 文案字典 ----
export interface UIStrings {
  nav: { home: string; posts: string; about: string };
  footer: string;                                   // 含 {year} 占位
  home: { h1: string; sub: string; latest: string; empty: string };
  homeMeta: { title: string; desc: string; keywords: string[] };
  blogIndex: { h1: string; empty: string };
  blogIndexMeta: { title: string; desc: string };
  about: {
    title: string; desc: string; h1: string;
    p1: string; p2: string;                         // p2 可含 <strong>
    whoH2: string; who: string[];
  };
  updatedLabel: string;
  softcta: { body: string; linkText: string };      // body 可含 <strong>
}

const SITE = 'https://conduitai.slateatelier.com';

export const UI: Record<LocaleCode, UIStrings> = {
  // ===== 中文（逐字搬现有页面，零回归）=====
  zh: {
    nav: { home: '首页', posts: '文章', about: '关于' },
    footer: '© {year} Conduit AI Blog · AI 工具与工作流教程',
    home: {
      h1: '用好 AI，省钱又高效',
      sub: 'Claude Code、Codex、Cursor 实战教程 · 模型选择 · 工作流自动化 · 成本优化。<br />真干货为主，少踩坑、多省钱。',
      latest: '最新文章',
      empty: '文章马上就来，敬请期待 ✨',
    },
    homeMeta: {
      title: 'Conduit AI Blog — AI 工具与工作流教程',
      desc: '分享 Claude Code、Codex、Cursor 等 AI 工具的实战教程、模型选择与成本优化技巧，帮你更省钱、更高效地用好 AI。',
      keywords: ['AI 工具教程', 'Claude Code', '按量付费 API', 'AI 成本优化'],
    },
    blogIndex: { h1: '全部文章', empty: '文章马上就来 ✨' },
    blogIndexMeta: { title: '全部文章 — Conduit AI Blog', desc: 'Conduit AI Blog 全部 AI 工具教程与成本优化文章列表。' },
    about: {
      title: '关于 — Conduit AI Blog',
      desc: 'Conduit AI Blog 专注 AI 工具实战、模型选择与成本优化，帮个人开发者更省钱地用好 Claude、GPT 等模型。',
      h1: '关于本站',
      p1: '这里分享 AI 工具的实战用法——Claude Code、Codex、Cursor 的技巧，模型怎么选，工作流怎么自动化，以及怎么把成本压下来。',
      p2: '原则很简单：<strong>先有用，再有我</strong>。绝大多数内容是能直接上手的干货，平台只在合适的地方自然提一句。',
      whoH2: '适合谁看',
      who: [
        '想低成本用上 Claude / GPT 的个人开发者、学生、独立开发者',
        '在用 Claude Code / Cursor / Codex，想提效、省 token 的人',
        '纠结模型怎么选、计费怎么算更划算的人',
      ],
    },
    updatedLabel: '更新于',
    softcta: {
      body: `我自己日常用的是按量付费的聚合 API 平台 <strong>Conduit AI</strong>——一个接口接入 Claude、GPT 等模型，用多少付多少、不用开月度订阅，新人注册送 HK$5 测试额度，支持支付宝/微信。把 BASE URL 换成它即可，Claude Code / Cursor / Codex 都能一键接入。`,
      linkText: '了解一下 →',
    },
  },

  // ===== English（逐字搬现有 /en 页面）=====
  en: {
    nav: { home: 'Home', posts: 'Posts', about: 'About' },
    footer: '© {year} Conduit AI Blog · AI tools & workflow guides',
    home: {
      h1: 'Use AI smarter, for less',
      sub: 'Hands-on guides for Claude Code, Codex & Cursor · model selection · workflow automation · cost optimization.<br />Practical first — fewer pitfalls, lower bills.',
      latest: 'Latest posts',
      empty: 'Posts coming soon ✨',
    },
    homeMeta: {
      title: 'Conduit AI Blog — AI Tools & Workflow Guides',
      desc: 'Hands-on guides for Claude Code, Codex and Cursor, plus model selection and cost optimization tips to use AI smarter and cheaper.',
      keywords: ['AI tools tutorial', 'Claude Code', 'pay as you go API', 'LLM cost optimization'],
    },
    blogIndex: { h1: 'All posts', empty: 'Posts coming soon ✨' },
    blogIndexMeta: { title: 'All Posts — Conduit AI Blog', desc: 'All AI tooling and cost-optimization posts on Conduit AI Blog.' },
    about: {
      title: 'About — Conduit AI Blog',
      desc: 'Conduit AI Blog focuses on hands-on AI tooling, model selection and cost optimization for individual developers.',
      h1: 'About',
      p1: 'This blog shares practical ways to use AI tools — tips for Claude Code, Codex and Cursor, how to pick the right model, how to automate workflows, and how to cut costs.',
      p2: 'The rule is simple: <strong>be useful first</strong>. Most of the content is hands-on; the platform only gets a natural mention where it fits.',
      whoH2: "Who it's for",
      who: [
        'Individual developers and students who want Claude / GPT without overpaying',
        'People using Claude Code / Cursor / Codex who want to ship faster and spend less',
        'Anyone weighing which model to use and which billing actually saves money',
      ],
    },
    updatedLabel: 'Updated',
    softcta: {
      body: `I use <strong>Conduit AI</strong> — a unified LLM API gateway. One BASE URL gives you Claude, GPT and more, pay-as-you-go (~1/8 of official price, save ~87%), no subscription. Top up from HK$50, HK$5 free credit on signup. Works with Claude Code, Cursor, and Codex.`,
      linkText: 'Try it →',
    },
  },

  // ===== 日本語 =====
  ja: {
    nav: { home: 'ホーム', posts: '記事', about: 'このサイトについて' },
    footer: '© {year} Conduit AI Blog · AI ツールとワークフローのガイド',
    home: {
      h1: 'AI を賢く、もっと安く使う',
      sub: 'Claude Code・Codex・Cursor の実践ガイド · モデル選択 · ワークフロー自動化 · コスト最適化。<br />実用第一——つまずきを減らし、請求を抑える。',
      latest: '最新の記事',
      empty: '記事は近日公開します ✨',
    },
    homeMeta: {
      title: 'Conduit AI Blog — AI ツールとワークフローのガイド',
      desc: 'Claude Code・Codex・Cursor の実践ガイドに加え、モデル選択と API コスト最適化のコツを紹介。AI をより賢く、より安く使いこなすために。',
      keywords: ['AI ツール チュートリアル', 'Claude Code', '従量課金 API', 'LLM コスト最適化'],
    },
    blogIndex: { h1: 'すべての記事', empty: '記事は近日公開します ✨' },
    blogIndexMeta: { title: 'すべての記事 — Conduit AI Blog', desc: 'Conduit AI Blog の AI ツールとコスト最適化に関する全記事一覧。' },
    about: {
      title: 'このサイトについて — Conduit AI Blog',
      desc: 'Conduit AI Blog は AI ツールの実践、モデル選択、コスト最適化に特化し、個人開発者がより安く Claude・GPT などを使いこなせるよう支援します。',
      h1: 'このサイトについて',
      p1: 'このブログでは AI ツールの実践的な使い方を紹介します——Claude Code・Codex・Cursor のテクニック、モデルの選び方、ワークフローの自動化、そしてコストの抑え方。',
      p2: '方針はシンプルです：<strong>まず役に立つこと</strong>。内容のほとんどは実践的なノウハウで、プラットフォームは自然な場面でひとこと触れる程度です。',
      whoH2: 'こんな方におすすめ',
      who: [
        '高い料金を払わずに Claude / GPT を使いたい個人開発者・学生',
        'Claude Code / Cursor / Codex を使い、より速く・より安く進めたい方',
        'どのモデルを使うべきか、どの課金方式が本当にお得かを検討している方',
      ],
    },
    updatedLabel: '更新日',
    softcta: {
      body: `私が普段使っているのは従量課金の統合 API プラットフォーム <strong>Conduit AI</strong> です——1 つの BASE URL で Claude・GPT などに接続でき、使った分だけ支払い、月額サブスク不要。公式の約 1/8 の価格（約 87% 節約）、HK$50 からチャージ、登録で HK$5 の無料クレジット、Alipay・WeChat Pay・クレジットカード対応。BASE URL を差し替えるだけで Claude Code・Cursor・Codex にそのまま使えます。`,
      linkText: '詳しく見る →',
    },
  },

  // ===== 한국어 =====
  ko: {
    nav: { home: '홈', posts: '글', about: '소개' },
    footer: '© {year} Conduit AI Blog · AI 도구 & 워크플로 가이드',
    home: {
      h1: 'AI를 더 똑똑하게, 더 저렴하게',
      sub: 'Claude Code·Codex·Cursor 실전 가이드 · 모델 선택 · 워크플로 자동화 · 비용 최적화.<br />실용 우선——시행착오는 줄이고, 청구서는 낮춥니다.',
      latest: '최신 글',
      empty: '글이 곧 올라옵니다 ✨',
    },
    homeMeta: {
      title: 'Conduit AI Blog — AI 도구 & 워크플로 가이드',
      desc: 'Claude Code·Codex·Cursor 실전 가이드와 함께 모델 선택, API 비용 최적화 팁을 공유합니다. AI를 더 똑똑하고 저렴하게 쓰세요.',
      keywords: ['AI 도구 튜토리얼', 'Claude Code', '사용량 기반 API', 'LLM 비용 최적화'],
    },
    blogIndex: { h1: '전체 글', empty: '글이 곧 올라옵니다 ✨' },
    blogIndexMeta: { title: '전체 글 — Conduit AI Blog', desc: 'Conduit AI Blog의 AI 도구 및 비용 최적화 관련 전체 글 목록.' },
    about: {
      title: '소개 — Conduit AI Blog',
      desc: 'Conduit AI Blog는 AI 도구 실전, 모델 선택, 비용 최적화에 집중하여 개인 개발자가 Claude·GPT 등을 더 저렴하게 활용하도록 돕습니다.',
      h1: '사이트 소개',
      p1: '이 블로그는 AI 도구의 실전 활용법을 공유합니다——Claude Code·Codex·Cursor 팁, 모델 고르는 법, 워크플로 자동화, 그리고 비용을 낮추는 방법.',
      p2: '원칙은 간단합니다: <strong>먼저 쓸모 있게</strong>. 대부분의 내용은 바로 써먹을 수 있는 실전 노하우이고, 플랫폼은 어울리는 곳에서만 자연스럽게 한 번 언급합니다.',
      whoH2: '이런 분께 추천',
      who: [
        '과한 비용 없이 Claude / GPT를 쓰고 싶은 개인 개발자·학생',
        'Claude Code / Cursor / Codex를 쓰며 더 빠르게·더 저렴하게 작업하려는 분',
        '어떤 모델을 써야 할지, 어떤 과금이 정말 이득인지 고민하는 분',
      ],
    },
    updatedLabel: '업데이트',
    softcta: {
      body: `제가 평소에 쓰는 건 사용량 기반 통합 API 플랫폼 <strong>Conduit AI</strong>입니다——하나의 BASE URL로 Claude·GPT 등에 연결하고, 쓴 만큼만 결제하며 월 구독이 필요 없습니다. 공식가의 약 1/8(약 87% 절약), HK$50부터 충전, 가입 시 HK$5 무료 크레딧, 알리페이·위챗페이·신용카드 지원. BASE URL만 바꾸면 Claude Code·Cursor·Codex에 그대로 쓸 수 있습니다.`,
      linkText: '살펴보기 →',
    },
  },

  // ===== Español =====
  es: {
    nav: { home: 'Inicio', posts: 'Artículos', about: 'Acerca de' },
    footer: '© {year} Conduit AI Blog · Guías de herramientas y flujos de trabajo de IA',
    home: {
      h1: 'Usa la IA de forma más inteligente y económica',
      sub: 'Guías prácticas de Claude Code, Codex y Cursor · selección de modelos · automatización de flujos · optimización de costes.<br />Primero lo práctico: menos tropiezos, facturas más bajas.',
      latest: 'Últimos artículos',
      empty: 'Artículos muy pronto ✨',
    },
    homeMeta: {
      title: 'Conduit AI Blog — Guías de herramientas y flujos de trabajo de IA',
      desc: 'Guías prácticas de Claude Code, Codex y Cursor, además de consejos de selección de modelos y optimización de costes para usar la IA de forma más inteligente y barata.',
      keywords: ['tutorial de herramientas de IA', 'Claude Code', 'API de pago por uso', 'optimización de costes de LLM'],
    },
    blogIndex: { h1: 'Todos los artículos', empty: 'Artículos muy pronto ✨' },
    blogIndexMeta: { title: 'Todos los artículos — Conduit AI Blog', desc: 'Todos los artículos sobre herramientas de IA y optimización de costes en Conduit AI Blog.' },
    about: {
      title: 'Acerca de — Conduit AI Blog',
      desc: 'Conduit AI Blog se centra en el uso práctico de herramientas de IA, la selección de modelos y la optimización de costes para desarrolladores individuales.',
      h1: 'Acerca del sitio',
      p1: 'Este blog comparte formas prácticas de usar herramientas de IA: trucos para Claude Code, Codex y Cursor, cómo elegir el modelo adecuado, cómo automatizar flujos de trabajo y cómo reducir costes.',
      p2: 'La regla es sencilla: <strong>ser útil primero</strong>. La mayor parte del contenido es práctico; la plataforma solo se menciona de forma natural cuando encaja.',
      whoH2: 'Para quién es',
      who: [
        'Desarrolladores individuales y estudiantes que quieren Claude / GPT sin pagar de más',
        'Quienes usan Claude Code / Cursor / Codex y quieren avanzar más rápido gastando menos',
        'Cualquiera que dude entre qué modelo usar y qué facturación ahorra de verdad',
      ],
    },
    updatedLabel: 'Actualizado',
    softcta: {
      body: `Yo uso <strong>Conduit AI</strong> — una puerta de enlace unificada de API de LLM. Una sola BASE URL te da Claude, GPT y más, con pago por uso (~1/8 del precio oficial, ahorra ~87%), sin suscripción. Recarga desde HK$50, HK$5 de crédito gratis al registrarte. Compatible con Claude Code, Cursor y Codex.`,
      linkText: 'Pruébalo →',
    },
  },
};

export { SITE as PLATFORM_SITE };
