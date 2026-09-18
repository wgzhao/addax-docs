import type { HeadConfig } from 'vitepress'
import { defineVersionedConfig } from '@viteplus/versions'

const readerPlugins = [
  { path: 'reader/accessreader', name: 'Access Reader' },
  { path: 'reader/cassandrareader', name: 'Cassandra Reader' },
  { path: 'reader/clickhousereader', name: 'ClickHouse Reader' },
  { path: 'reader/databendreader', name: 'Databend Reader' },
  { path: 'reader/dbfreader', name: 'DBF Reader' },
  { path: 'reader/dorisreader', name: 'Doris Reader' },
  { path: 'reader/elasticsearchreader', name: 'Elasticsearch Reader' },
  { path: 'reader/excelreader', name: 'Excel Reader' },
  { path: 'reader/ftpreader', name: 'FTP Reader' },
  { path: 'reader/hanareader', name: 'HANA Reader' },
  { path: 'reader/hbase20xreader', name: 'HBase 2.0.x Reader' },
  { path: 'reader/hbase20xsqlreader', name: 'HBase 2.0.x SQL Reader' },
  { path: 'reader/hdfsreader', name: 'HDFS Reader' },
  { path: 'reader/hivereader', name: 'Hive Reader' },
  { path: 'reader/httpreader', name: 'HTTP Reader' },
  { path: 'reader/influxdb2reader', name: 'InfluxDB 2 Reader' },
  { path: 'reader/jsonfilereader', name: 'JSON File Reader' },
  { path: 'reader/kafkareader', name: 'Kafka Reader' },
  { path: 'reader/kudureader', name: 'Kudu Reader' },
  { path: 'reader/mongodbreader', name: 'MongoDB Reader' },
  { path: 'reader/mysqlreader', name: 'MySQL Reader' },
  { path: 'reader/oraclereader', name: 'Oracle Reader' },
  { path: 'reader/postgresqlreader', name: 'PostgreSQL Reader' },
  { path: 'reader/rdbmsreader', name: 'RDBMS Reader' },
  { path: 'reader/redisreader', name: 'Redis Reader' },
  { path: 'reader/s3reader', name: 'S3 Reader' },
  { path: 'reader/sqlitereader', name: 'SQLite Reader' },
  { path: 'reader/sqlserverreader', name: 'SQL Server Reader' },
  { path: 'reader/streamreader', name: 'Stream Reader' },
  { path: 'reader/sybasereader', name: 'Sybase Reader' },
  { path: 'reader/tdenginereader', name: 'TDengine Reader' },
  { path: 'reader/txtfilereader', name: 'Text File Reader' },
]

const writerPlugins = [
  { path: 'writer/accesswriter', name: 'Access Writer' },
  { path: 'writer/cassandrawriter', name: 'Cassandra Writer' },
  { path: 'writer/clickhousewriter', name: 'ClickHouse Writer' },
  { path: 'writer/databendwriter', name: 'Databend Writer' },
  { path: 'writer/dbfwriter', name: 'DBF Writer' },
  { path: 'writer/doriswriter', name: 'Doris Writer' },
  { path: 'writer/elasticsearchwriter', name: 'Elasticsearch Writer' },
  { path: 'writer/excelwriter', name: 'Excel Writer' },
  { path: 'writer/ftpwriter', name: 'FTP Writer' },
  { path: 'writer/greenplumwriter', name: 'Greenplum Writer' },
  { path: 'writer/hanawriter', name: 'HANA Writer' },
  { path: 'writer/hbase20xsqlwriter', name: 'HBase 2.0.x SQL Writer' },
  { path: 'writer/hdfswriter', name: 'HDFS Writer' },
  { path: 'writer/icebergwriter', name: 'Iceberg Writer' },
  { path: 'writer/influxdb2writer', name: 'InfluxDB 2 Writer' },
  { path: 'writer/kafkawriter', name: 'Kafka Writer' },
  { path: 'writer/kuduwriter', name: 'Kudu Writer' },
  { path: 'writer/mongodbwriter', name: 'MongoDB Writer' },
  { path: 'writer/mysqlwriter', name: 'MySQL Writer' },
  { path: 'writer/oraclewriter', name: 'Oracle Writer' },
  { path: 'writer/paimonwriter', name: 'Paimon Writer' },
  { path: 'writer/postgresqlwriter', name: 'PostgreSQL Writer' },
  { path: 'writer/rdbmswriter', name: 'RDBMS Writer' },
  { path: 'writer/rediswriter', name: 'Redis Writer' },
  { path: 'writer/s3writer', name: 'S3 Writer' },
  { path: 'writer/sqlitewriter', name: 'SQLite Writer' },
  { path: 'writer/sqlserverwriter', name: 'SQL Server Writer' },
  { path: 'writer/starrockswriter', name: 'StarRocks Writer' },
  { path: 'writer/streamwriter', name: 'Stream Writer' },
  { path: 'writer/sybasewriter', name: 'Sybase Writer' },
  { path: 'writer/tdenginewriter', name: 'TDengine Writer' },
  { path: 'writer/txtfilewriter', name: 'Text File Writer' },
]

const enReaderNavItems = readerPlugins.map(plugin => ({
  text: plugin.name,
  link: `/en/${plugin.path}`
}))

const zhReaderNavItems = readerPlugins.map(plugin => ({
  text: plugin.name,
  link: `/${plugin.path}`
}))

const enWriterNavItems = writerPlugins.map(plugin => ({
  text: plugin.name,
  link: `/en/${plugin.path}`
}))

const zhWriterNavItems = writerPlugins.map(plugin => ({
  text: plugin.name,
  link: `/${plugin.path}`
}))

const enNav = [
  { text: 'Home', link: '/en/' },
  { text: 'Quickstart', link: '/en/quick-start' },
  { text: 'Docs', link: '/en/introduction' },
  { text: 'Plugins', items: [
    { text: 'Reader Plugins', items: enReaderNavItems },
    { text: 'Writer Plugins', items: enWriterNavItems },
  ]},
  { component: 'VersionSwitcher' },
]

const enSidebar = [
  { text: 'Getting Started', items: [
    { text: 'Introduction', link: '/en/introduction' },
    { text: 'Quick Start', link: '/en/quick-start' },
    { text: 'Job Setup', link: '/en/job-setup' },
  ]},
  { text: 'Guides', items: [
    { text: 'Command Line', link: '/en/commandline' },
    { text: 'Job Config Generation', link: '/en/gen' },
    { text: 'Debug', link: '/en/howto-debug' },
    { text: 'Encrypt Password', link: '/en/encrypt-password' },
    { text: 'Stats Report', link: '/en/statistic-report' },
    { text: 'Transformer', link: '/en/transformer' },
    { text: 'Server', link: '/en/server' },
  ]},
  { text: 'Developer', items: [
    { text: 'Plugin Development', link: '/en/plugin-development' },
  ]},
  { text: 'Plugins', items: [
    { text: 'Reader Plugins', collapsed: true, items: enReaderNavItems },
    { text: 'Writer Plugins', collapsed: true, items: enWriterNavItems },
  ]}
]

const zhNav = [
  { text: '首页', link: '/' },
  { text: '快速开始', link: '/quick-start' },
  { text: '文档', link: '/introduction' },
  { text: '插件', items: [
    { text: '读取插件', items: zhReaderNavItems },
    { text: '写入插件', items: zhWriterNavItems },
  ]},
  { component: 'VersionSwitcher' },
]

const zhSidebar = [
  { text: '入门', items: [
    { text: '简介', link: '/introduction' },
    { text: '快速开始', link: '/quick-start' },
    { text: '作业配置', link: '/job-setup' },
  ]},
  { text: '使用指南', items: [
    { text: '命令行', link: '/commandline' },
    { text: '作业配置生成', link: '/gen' },
    { text: '调试', link: '/debug' },
    { text: '密码加密', link: '/encrypt-password' },
    { text: '统计报告', link: '/statistic-report' },
    { text: '数据转换', link: '/transformer' },
    { text: '服务端', link: '/server' },
  ]},
  { text: '开发者', items: [
    { text: '插件开发', link: '/plugin-development' },
  ]},
  { text: '插件列表', items: [
    { text: '读取插件', collapsed: true, items: zhReaderNavItems },
    { text: '写入插件', collapsed: true, items: zhWriterNavItems },
  ]}
]

const SITE_URL = 'https://addax.wgzhao.com'
const SITE_TITLE = 'Addax Documentation'
const SOCIAL_IMAGE = `${SITE_URL}/images/social-preview.png`

// Chat clients and search engines read these before any page content, so this is
// the first thing a shared link says about Addax. The image is the same card the
// GitHub repo uses, so a link to either surface looks identical.
const socialMeta: HeadConfig[] = [
  ['meta', { property: 'og:type', content: 'website' }],
  ['meta', { property: 'og:site_name', content: 'Addax' }],
  ['meta', { property: 'og:image', content: SOCIAL_IMAGE }],
  ['meta', { property: 'og:image:width', content: '1280' }],
  ['meta', { property: 'og:image:height', content: '640' }],
  ['meta', { property: 'og:image:alt', content: 'Addax — Any source. Any target. Fast.' }],
  ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ['meta', { name: 'twitter:image', content: SOCIAL_IMAGE }],
]

// https://vitepress.dev/reference/site-config
export default defineVersionedConfig({
  versionsConfig: {
    current: '6.1.0',
    sources: 'src',
    archive: 'archive',
    versionSwitcher: {
      text: '版本',
      includeCurrentVersion: true
    }
  },
  title: SITE_TITLE,
  description: 'Actively maintained successor to Alibaba DataX — a fast, versatile, open-source ETL tool for 30+ RDBMS and NoSQL data sources',
  // Vercel already 308-redirects /page.html to /page, so without this the sitemap
  // and every og:url would point at a redirect instead of the served URL.
  cleanUrls: true,
  head: socialMeta,
  locales: {
    root: {
      label: ' 中文',
      lang: 'zh',
      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: {src: '/images/logo.svg', width: 32, height: 32},
        nav: zhNav,
        sidebar: zhSidebar,
        search: { provider: 'local' },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/wgzhao/addax' }
        ]
      }
    },
    en: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        logo: {src: '/images/logo.svg', width: 32, height: 32},
        nav: enNav,
        sidebar: enSidebar,
        search: { provider: 'local' },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/wgzhao/addax' }
        ]
      }
    }
  },
  mermaid:{
    //mermaidConfig !theme here works for light mode since dark theme is forced in dark mode
  },
  sitemap: {
    hostname: SITE_URL
  },
  transformHead({ pageData, title, description }) {
    // Match the URLs VitePress puts in the sitemap: index.md collapses to the
    // directory, every other page drops its extension.
    const path = pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
    const url = `${SITE_URL}/${path}`
    // VitePress appends the site title; a share card reads better without it.
    const suffix = ` | ${SITE_TITLE}`
    const ogTitle = title.endsWith(suffix) ? title.slice(0, -suffix.length) : title
    return [
      ['meta', { property: 'og:title', content: ogTitle }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:locale', content: path.startsWith('en/') ? 'en_US' : 'zh_CN' }],
      ['meta', { name: 'twitter:title', content: ogTitle }],
      ['meta', { name: 'twitter:description', content: description }],
    ]
  },
  lastUpdated: true,
  themeConfig: {
    outline: {
      level: [2, 3],
      label: '本页目录'
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    footer: {
      message: 'Released under the <a href="https://github.com/wgzhao/Addax/blob/master/LICENSE">Apache License 2.0</a>.',
      copyright: 'Copyright © 2018-present <a href="https://github.com/wgzhao">Steven Zhao</a>'
    }
  }
})
