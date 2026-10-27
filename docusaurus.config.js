// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";
import remarkDirective from "remark-directive";
import remarkDocScope from "./src/remark/remark-doc-scope.js";

const buildProduct = process.env.DOC_BUILD_PRODUCT?.trim() || "";
const buildVersion = process.env.DOC_BUILD_VERSION?.trim() || "";
const COPYRIGHT_START_YEAR = 2024;
const currentYear = new Date().getFullYear();
const copyrightYearLabel =
  currentYear > COPYRIGHT_START_YEAR
    ? `${COPYRIGHT_START_YEAR}-${currentYear}`
    : `${COPYRIGHT_START_YEAR}`;

const SITE_BASE_URL = "/model_zoo_doc/";
const DEFAULT_LOCALE = "zh-Hans";
const LOCALES = ["zh-Hans", "en"];
// GitHub Pages 等静态托管只认站点根目录的 404.html（默认语言）。
// 英文地址 404 时浏览器仍停在 /en/...，但返回的是中文 404.html。
// 若 html lang 与 URL 语言前缀不一致，改去该语言自己的 404.html。
const locale404RedirectScript = `(function () {
  var base = ${JSON.stringify(SITE_BASE_URL)};
  var locales = ${JSON.stringify(LOCALES.filter((locale) => locale !== DEFAULT_LOCALE))};
  var path = window.location.pathname || "";
  if (path.indexOf(base) !== 0) return;
  var parts = path.slice(base.length).split("/").filter(Boolean);
  var locale = parts[0];
  if (locales.indexOf(locale) === -1) return;
  var page = parts[1] || "";
  if (page === "404" || page === "404.html") return;
  var htmlLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  if (htmlLang === locale.toLowerCase()) return;
  window.location.replace(base + locale + "/404.html");
})();`;


/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Model Zoo DOC",
  // tagline: 'Dinosaurs are cool',
  favicon: "img/logo.png",
  // Set the production url of your site here
  url: "https://developer.d-robotics.cc",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: SITE_BASE_URL,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "D-Robotics", // Usually your GitHub org/user name.
  projectName: "model_zoo_doc", // Usually your repo name.

  // onBrokenLinks: 'throw',

  //add by xgs for build reduce bug
  onBrokenLinks: "warn", // 或 'ignore'
  onBrokenMarkdownLinks: "warn",


  //add vy xgs for analysis
  scripts: [
    {
      src: "https://hm.baidu.com/hm.js?24dd63cad43b63889ea6bede5fd1ab9e",
      async: true,
    },
    // Dify Chatbot Configuration
    {
      src: "/model_zoo_doc/js/dify-config.js",
    },
    {
      src: "https://rdk.d-robotics.cc/embed.min.js",
      id: "rJYrxmxmjOkjEx2c",
      defer: true,
    },
  ],


  headTags: [
    {
      tagName: "meta",
      attributes: {
        name: "algolia-site-verification",
        content: "7D2FA77E12885A7C",
      },
    },
    {
      tagName: "script",
      attributes: {
        defer: "defer",
        src: "https://cloud.umami.is/script.js",
        "data-website-id": "b0c771b8-947e-4fa4-8880-606ecab89c36",
      },
    },
    {
      tagName: "script",
      attributes: {},
      innerHTML: locale404RedirectScript,
    },
  ],
  // add by xgs for translate
  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales: LOCALES,
    localeConfigs: {
      en: {
        label: "EN",
      },
      "zh-Hans": {
        label: "CN",
      },
    },
  },
  customFields: {
    docBuildScope:
      process.env.DOC_BUILD_PRODUCT?.trim() &&
      process.env.DOC_BUILD_VERSION?.trim()
        ? {
            product: process.env.DOC_BUILD_PRODUCT.trim(),
            version: process.env.DOC_BUILD_VERSION.trim(),
          }
        : null,
  
        feedbackFloat: {
          enabled: true,
              questionnaireUrl: "https://horizonrobotics.feishu.cn/share/base/form/shrcnLQ9OfYQO03cebdkNfOmkCh",
              questionnaireUrlByLocale: {
                "zh-Hans": "https://horizonrobotics.feishu.cn/share/base/form/shrcnLQ9OfYQO03cebdkNfOmkCh",
                en: "https://horizonrobotics.feishu.cn/share/base/form/shrcnLQ9OfYQO03cebdkNfOmkCh",
          },
          // 站点内路径规则（基于 baseUrl 之后的路径）：
          // - "/" 精确匹配中文首页
          // - "/en" 精确匹配英文首页
          // - "/*" 匹配全部页面
          // - "/en/*" 匹配英文全部页面
          showOnPathRules: ["/*"],
          hideOnPathRules: [],
        },
      },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/", // 修改默认文档路径
          sidebarPath: "./sidebars.js",
          showLastUpdateTime: true,
          remarkPlugins: [remarkDirective, remarkDocScope],

          
        },
        blog: { showReadingTime: true },
        pages: { exclude: ["/imager/**", "**/dl/**"] },
        theme: { customCss: "./src/css/custom.css" },
        sitemap: { lastmod: "date" },
      }),
    ],
  ],
  plugins: [
    require.resolve("./src/plugins/sidebar-scope-config-plugin"),
    "docusaurus-plugin-image-zoom",
    [
      "docusaurus-plugin-copy-page-button",
      {
        // Match the requested dropdown actions in screenshot.
        enabledActions: ["copy", "view", "claude"],
        // Static .md routes are incompatible with OSS "append /index.html" rules.
        generateMarkdownRoutes: false,
      },
    ],
  ],
  markdown: {
    mermaid: true,
  },
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      // Algolia DocSearch. Search-Only API Key 可以公开；Admin/Write Key 只放 CI Secret。
      // 索引由 scripts/algolia-index.mjs 在全量重建时写入（不使用 Algolia Crawler）。
      algolia: {
        appId: process.env.ALGOLIA_APP_ID || "1VU781LYTV",
        apiKey:
          process.env.ALGOLIA_SEARCH_KEY ||
          "fb65c6e54a52ce6fba0645bd2630e79b",
        indexName: process.env.ALGOLIA_INDEX_NAME || "model_zoo_doc",
        // 必须：Docusaurus 会注入 language / docusaurus_tag 上下文过滤
        contextualSearch: true,
        searchPagePath: "search",
      },
      // ✅ 新增：支持 h2 ~ h5 add by xgs for table of contents
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 5,
    },
      navbar: {
        title: "D-Robotics",
        logo: {
          alt: "地瓜机器人社区 logo",
          src: "img/logo.png",
          href: "https://d-robotics.cc/", // 修改为文档根路径
        },
        items: [
          // {
          //   type: "docSidebar",
          //   sidebarId: "tutorialSidebar",
          //   position: "left",
          //   // label: "Model Zoo X3 / X5",
          // },
          {
            type: "custom-DocScopeSelectors",
            position: "left",
          },
          // add by xgs for S100_doc 2025 年 4 月 21 日 16:34:51 新增S100_doc npm install 去新增插件
          // {
          //   to: '/docs_s/',  // 与routeBasePath保持一致
          //   label: 'RDK S Series',
          //   position: 'left',
          //   // activeBaseRegex: '/docs_s/',
          // },
          // {
          //   type: "docSidebar",
          //   sidebarId: "tutorialSidebar",
          //   docsPluginId: "docs_s",
          //   position: "left",
          //   label: "RDK S100",
          // },
          
          {
            href: (() => {
              if (process.env.DOCUSAURUS_CURRENT_LOCALE === "en") {
                return "https://developer.d-robotics.cc/en";
              }
              return "https://developer.d-robotics.cc/";
            })(),
            label: "Community",
            position: "left",
            className: "navbar-community-link",
          },

         
          {
            href: "https://github.com/D-Robotics",
            label: "GitHub",
            position: "right",
            className: "navbar-github-link",
          },
          // add by xgs for translate show
          {
            type: "localeDropdown",
            position: "right",
            className: "navbar-locale-switch",
          },
          {
            type: "search",
            position: "right",
          },  
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "友情链接",
            items: [
              {
                label: "古月居",
                href: "https://www.guyuehome.com/",
              },
            ],
          },
          {
            title: "联系我们",
            items: [
              {
                label: "GitHub",
                href: "https://github.com/D-Robotics",
              },
              {
                label: "BiLiBiLi",
                href: (() => {
                  if (process.env.DOCUSAURUS_CURRENT_LOCALE === "en") {
                    return "https://www.youtube.com/@D-Robotics";
                  }
                  return "https://space.bilibili.com/437998606";
                })(),
              },
            ],
          },
        ],
        copyright: `Copyright © ${copyrightYearLabel} D-Robotics.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      zoom: {
        selector: ".markdown img",
        background: {
          light: "rgb(255, 255, 255)",
          dark: "rgb(50, 50, 50)",
        },
        config: {
          margin: 24,
          scrollOffset: 80,
        },
      },
    }),
  themes: [
    "@docusaurus/theme-mermaid",
    // 搜索已切换为 Algolia（见 themeConfig.algolia）。
    // 旧的本地搜索 @easyops-cn/docusaurus-search-local 已移除，
    // Pagefind 全页实现保留在 src/legacy/search-page-pagefind.jsx 备查。
  ],
};

export default config;
