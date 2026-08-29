<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const isZh = computed(() => lang.value.startsWith('zh'))

const connectorGroups = computed(() => [
  {
    label: isZh.value ? '关系型数据库' : 'Relational databases',
    logos: [
      { name: 'MySQL', logo: 'mysql' },
      { name: 'PostgreSQL', logo: 'postgresql' },
      { name: 'SQL Server', logo: 'sqlserver' },
      { name: 'Oracle', logo: 'oracle' },
      { name: 'DB2', logo: 'db2' },
      { name: 'Sybase', logo: 'sybase' },
      { name: 'Greenplum', logo: 'greenplum' },
      { name: 'SQLite', logo: 'sqlite' },
      { name: 'Access', logo: 'access' },
      { name: 'DBF', logo: 'dbase' },
    ],
    texts: [],
  },
  {
    label: isZh.value ? '分析型数据库' : 'Analytical databases',
    logos: [
      { name: 'ClickHouse', logo: 'clickhouse' },
      { name: 'Doris', logo: 'doris' },
      { name: 'StarRocks', logo: 'starrocks' },
      { name: 'Databend', logo: 'databend' },
    ],
    texts: [],
  },
  {
    label: isZh.value ? 'NoSQL 与缓存' : 'NoSQL & cache',
    logos: [
      { name: 'MongoDB', logo: 'mongodb' },
      { name: 'Redis', logo: 'redis' },
      { name: 'Cassandra', logo: 'cassandra' },
      { name: 'HBase', logo: 'hbase' },
    ],
    texts: [],
  },
  {
    label: isZh.value ? '数据湖与文件存储' : 'Data lake & file storage',
    logos: [
      { name: 'Iceberg', logo: 'iceberg' },
      { name: 'Paimon', logo: 'paimon' },
      { name: 'Kudu', logo: 'kudu' },
      { name: 'Hive', logo: 'hive' },
      { name: 'MinIO', logo: 'minio' },
      { name: 'Amazon S3', logo: 's3' },
      { name: 'HDFS', logo: 'hdfs' },
      { name: 'Excel', logo: 'excel' },
      { name: 'FTP', logo: 'ftp' },
      { name: 'JSON', logo: 'json' },
      { name: 'HTTP', logo: 'http' },
    ],
    texts: [],
  },
  {
    label: isZh.value ? '时序与消息流' : 'Time-series & streaming',
    logos: [
      { name: 'TDengine', logo: 'tdengine' },
      { name: 'InfluxDB', logo: 'influxdata' },
      { name: 'Kafka', logo: 'kafka' },
      { name: 'Stream', logo: 'stream' },
    ],
    texts: [],
  },
])

const heroLogos = ['mysql', 'postgresql', 'clickhouse', 'kafka', 'redis', 'mongodb', 'hbase', 'hive']

const copy = computed(() => {
  if (isZh.value) {
    return {
      badge: '开源 · 持续维护 · Apache 2.0 协议',
      heroTitle1: '异构数据源，',
      heroTitle2: '一份 JSON 搞定同步',
      heroSub: '用一份 JSON 配置，把"读取 → 转换 → 写入"变成可复用、可运维的同步作业。内置 70+ 读写插件，覆盖主流数据源，开箱即用。',
      ctaPrimary: '快速开始',
      ctaSecondary: 'GitHub',
      heroNote: '几分钟完成安装 · 无需编写代码',
      trustLabel: '覆盖主流数据源，开箱即用',
      features: [
        { icon: 'plugin', title: '丰富的连接器生态', desc: '内置 70+ 读写插件，覆盖 MySQL、Oracle、ClickHouse、HDFS、Kafka、HBase、MongoDB 等主流数据源，开箱即用。', link: '/introduction', linkText: '查看支持的数据源' },
        { icon: 'transform', title: '强大的数据转换能力', desc: '内置脱敏、补全、过滤与类型转换，并支持 Groovy 自定义逻辑，适配真实世界的脏数据场景。', link: '/transformer', linkText: '了解数据转换' },
        { icon: 'observe', title: '可观测的运行质量', desc: '强类型数据传输配合统计报告，让你更快定位"是数据问题还是配置问题"。', link: '/statistic-report', linkText: '查看统计报告' },
      ],
      codeEyebrow: '声明式配置',
      codeTitle: '一份 JSON，搞定数据同步',
      codeDesc: '声明式配置 reader 和 writer，无需编写代码即可完成异构数据源之间的数据同步。同一套配置，从开发到生产。',
      codePoints: [
        { strong: '强类型传输', text: '列级别类型校验，脏数据提前拦截' },
        { strong: '插件化架构', text: 'reader / writer 独立插件，按需组合' },
        { strong: '可视化报告', text: '每次运行产出读取/写入/耗时统计' },
      ],
      connectorsTitle: '覆盖主流数据源',
      connectorsDesc: '内置 70+ 读写插件，从关系型数据库到 NoSQL，从文件系统到消息队列，满足绝大多数数据同步场景。',
      connectorsCta: '查看全部插件',
      workflowTitle: '三步开始数据同步',
      workflowSteps: [
        { num: '01', title: '安装 Addax', desc: '通过 Docker、一键脚本或源码编译安装，几分钟内即可就绪。' },
        { num: '02', title: '编写作业 JSON', desc: '选择 reader 和 writer 插件，配置连接信息和字段映射。' },
        { num: '03', title: '运行并监控', desc: '通过 CLI 运行作业，查看统计报告，按需调试。' },
      ],
      stats: [
        { num: '70+', label: '读写插件' },
        { num: '30+', label: '数据源类型' },
        { num: 'Apache 2.0', label: '开源协议' },
        { num: '强类型', label: '数据传输' },
      ],
      resourcesTitle: '深入了解 Addax',
      resources: [
        { title: '项目简介', desc: '了解 Addax 的设计理念和核心架构', link: '/introduction', icon: 'book' },
        { title: '快速开始', desc: '几分钟内完成安装并运行第一个同步任务', link: '/quick-start', icon: 'rocket' },
        { title: '作业配置', desc: '学习 JSON 作业文件的编写规范和最佳实践', link: '/job-setup', icon: 'code' },
        { title: '插件开发', desc: '为 Addax 开发自定义 reader 或 writer 插件', link: '/plugin-development', icon: 'puzzle' },
      ],
      ctaTitle: '开始构建你的数据同步管道',
      ctaDesc: '几分钟内安装 Addax，用一份 JSON 配置跑通第一个同步作业。',
      quickStartLink: '/quick-start',
    }
  }
  return {
    badge: 'Open source · Actively maintained · Apache 2.0',
    heroTitle1: 'Heterogeneous sources,',
    heroTitle2: 'one JSON to sync them all',
    heroSub: 'Turn read → transform → write into reusable, operable sync jobs with a single JSON config. 70+ built-in plugins cover the mainstream data sources, ready out of the box.',
    ctaPrimary: 'Quick Start',
    ctaSecondary: 'GitHub',
    heroNote: 'Install in minutes · No code required',
    trustLabel: 'Covers mainstream data sources, out of the box',
    features: [
      { icon: 'plugin', title: 'Rich connector ecosystem', desc: '70+ built-in reader/writer plugins covering MySQL, Oracle, ClickHouse, HDFS, Kafka, HBase, MongoDB and more — ready to use.', link: '/en/introduction', linkText: 'View supported sources' },
      { icon: 'transform', title: 'Powerful data transformation', desc: 'Built-in masking, padding, filtering and type conversion, plus Groovy custom logic for real-world dirty data.', link: '/en/transformer', linkText: 'Learn about transforms' },
      { icon: 'observe', title: 'Observable run quality', desc: 'Strong-typed transport with statistical reports helps you quickly tell data issues from config issues.', link: '/en/statistic-report', linkText: 'View stats report' },
    ],
    codeEyebrow: 'Declarative config',
    codeTitle: 'One JSON file. That\'s all it takes.',
    codeDesc: 'Declare reader and writer plugins in JSON — no code needed to sync data between heterogeneous sources. One config, dev to prod.',
    codePoints: [
      { strong: 'Strong-typed transport', text: 'Column-level type checks catch dirty data early' },
      { strong: 'Plugin architecture', text: 'Reader/writer plugins combine on demand' },
      { strong: 'Visual reports', text: 'Every run produces read/write/timing stats' },
    ],
    connectorsTitle: 'Connect to your stack',
    connectorsDesc: '70+ built-in plugins covering RDBMS, NoSQL, file systems, and message queues for virtually any sync scenario.',
    connectorsCta: 'View all plugins',
    workflowTitle: 'Get started in 3 steps',
    workflowSteps: [
      { num: '01', title: 'Install Addax', desc: 'Quick setup via Docker, one-line script, or build from source.' },
      { num: '02', title: 'Write a job JSON', desc: 'Pick reader/writer plugins, configure connections and column mappings.' },
      { num: '03', title: 'Run and monitor', desc: 'Run via CLI, check stats reports, and debug as needed.' },
    ],
    stats: [
      { num: '70+', label: 'Reader/writer plugins' },
      { num: '30+', label: 'Data source types' },
      { num: 'Apache 2.0', label: 'Open source license' },
      { num: 'Strong-typed', label: 'Data transport' },
    ],
    resourcesTitle: 'Dive deeper into Addax',
    resources: [
      { title: 'Introduction', desc: 'Learn about Addax design philosophy and core architecture', link: '/en/introduction', icon: 'book' },
      { title: 'Quick Start', desc: 'Install and run your first sync job in minutes', link: '/en/quick-start', icon: 'rocket' },
      { title: 'Job Setup', desc: 'Learn JSON job file conventions and best practices', link: '/en/job-setup', icon: 'code' },
      { title: 'Plugin Development', desc: 'Build custom reader or writer plugins for Addax', link: '/en/plugin-development', icon: 'puzzle' },
    ],
    ctaTitle: 'Start building your data pipeline',
    ctaDesc: 'Install Addax in minutes and run your first sync job with a single JSON file.',
    quickStartLink: '/en/quick-start',
  }
})

const jobJsonHighlighted = `<span class="tok-punc">{</span>
  <span class="tok-key">"job"</span><span class="tok-punc">:</span> <span class="tok-punc">{</span>
    <span class="tok-key">"content"</span><span class="tok-punc">:</span> <span class="tok-punc">[{</span>
      <span class="tok-key">"reader"</span><span class="tok-punc">:</span> <span class="tok-punc">{</span>
        <span class="tok-key">"name"</span><span class="tok-punc">:</span> <span class="tok-str">"mysqlreader"</span><span class="tok-punc">,</span>
        <span class="tok-key">"parameter"</span><span class="tok-punc">:</span> <span class="tok-punc">{</span>
          <span class="tok-key">"username"</span><span class="tok-punc">:</span> <span class="tok-str">"root"</span><span class="tok-punc">,</span>
          <span class="tok-key">"password"</span><span class="tok-punc">:</span> <span class="tok-str">"******"</span><span class="tok-punc">,</span>
          <span class="tok-key">"column"</span><span class="tok-punc">:</span> <span class="tok-punc">[</span><span class="tok-str">"*"</span><span class="tok-punc">],</span>
          <span class="tok-key">"connection"</span><span class="tok-punc">:</span> <span class="tok-punc">[{</span>
            <span class="tok-key">"jdbcUrl"</span><span class="tok-punc">:</span> <span class="tok-punc">[</span><span class="tok-str">"jdbc:mysql://host:3306/db"</span><span class="tok-punc">],</span>
            <span class="tok-key">"table"</span><span class="tok-punc">:</span> <span class="tok-punc">[</span><span class="tok-str">"source_table"</span><span class="tok-punc">]</span>
          <span class="tok-punc">}]</span>
        <span class="tok-punc">}</span>
      <span class="tok-punc">},</span>
      <span class="tok-key">"writer"</span><span class="tok-punc">:</span> <span class="tok-punc">{</span>
        <span class="tok-key">"name"</span><span class="tok-punc">:</span> <span class="tok-str">"clickhousewriter"</span><span class="tok-punc">,</span>
        <span class="tok-key">"parameter"</span><span class="tok-punc">:</span> <span class="tok-punc">{</span>
          <span class="tok-key">"username"</span><span class="tok-punc">:</span> <span class="tok-str">"default"</span><span class="tok-punc">,</span>
          <span class="tok-key">"password"</span><span class="tok-punc">:</span> <span class="tok-str">"******"</span><span class="tok-punc">,</span>
          <span class="tok-key">"column"</span><span class="tok-punc">:</span> <span class="tok-punc">[</span><span class="tok-str">"*"</span><span class="tok-punc">],</span>
          <span class="tok-key">"connection"</span><span class="tok-punc">:</span> <span class="tok-punc">[{</span>
            <span class="tok-key">"jdbcUrl"</span><span class="tok-punc">:</span> <span class="tok-str">"jdbc:clickhouse://host:8123/db"</span><span class="tok-punc">,</span>
            <span class="tok-key">"table"</span><span class="tok-punc">:</span> <span class="tok-punc">[</span><span class="tok-str">"target_table"</span><span class="tok-punc">]</span>
          <span class="tok-punc">}]</span>
        <span class="tok-punc">}</span>
      <span class="tok-punc">}</span>
    <span class="tok-punc">}]</span>
  <span class="tok-punc">}</span>
<span class="tok-punc">}</span>`

const featureIcons: Record<string, string> = {
  plugin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M5 5L7 7"/><path d="M19 5L17 7"/><path d="M5 19L7 17"/><path d="M19 19L17 17"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/></svg>`,
  transform: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h4l-4 10"/><path d="M14 7l4 10h-4l4-10"/><path d="M9 17h6"/><path d="M9 7h6"/></svg>`,
  observe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l4-4 4 4 5-6"/><circle cx="7" cy="14" r="1.5"/><circle cx="11" cy="10" r="1.5"/><circle cx="15" cy="14" r="1.5"/></svg>`,
}

const stepIcons = [
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>`,
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
]

const resourceIcons: Record<string, string> = {
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  rocket: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
  code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  puzzle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02z"/></svg>`,
}

const githubLink = 'https://github.com/wgzhao/addax'
</script>

<template>
  <div class="landing-page">
    <!-- ===================== HERO ===================== -->
    <section class="hero">
      <div class="hero-gradient"></div>
      <div class="hero-glow"></div>
      <div class="container">
        <div class="hero-content">
          <span class="hero-badge"><span class="dot"></span> {{ copy.badge }}</span>
          <h1>{{ copy.heroTitle1 }}<br><span class="grad">{{ copy.heroTitle2 }}</span></h1>
          <p class="hero-sub">{{ copy.heroSub }}</p>
          <div class="hero-actions">
            <a class="btn btn-primary btn-lg" :href="copy.quickStartLink">{{ copy.ctaPrimary }} →</a>
            <a class="btn btn-ghost-light btn-lg" :href="githubLink">{{ copy.ctaSecondary }}</a>
          </div>
          <p class="hero-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
            {{ copy.heroNote }}
          </p>
        </div>

        <!-- 作业监控浮卡 -->
        <div class="hero-card">
          <div class="hero-card-bar">
            <div class="dots"><span></span><span></span><span></span></div>
            <div class="url">addax --job sync_job.json</div>
          </div>
          <div class="hero-card-body">
            <aside class="hc-side">
              <h5>{{ isZh ? '作业列表' : 'Jobs' }}</h5>
              <ul>
                <li class="active"><span class="ic" style="background:#4573fb"></span> mysql → clickhouse</li>
                <li><span class="ic" style="background:#00c896"></span> pg → hdfs</li>
                <li><span class="ic" style="background:#00d4ff"></span> kafka → redis</li>
                <li><span class="ic" style="background:#ff5996"></span> hbase → s3</li>
                <li><span class="ic" style="background:#ffa94d"></span> excel → mongodb</li>
              </ul>
            </aside>
            <div class="hc-main">
              <div class="hc-top">
                <div>
                  <h3>{{ isZh ? '作业执行监控' : 'Job execution monitor' }}</h3>
                  <p>mysqlreader → clickhousewriter</p>
                </div>
                <span class="hc-tag">{{ isZh ? '运行中' : 'Running' }}</span>
              </div>
              <div class="hc-stats">
                <div class="hc-stat">
                  <div class="label">{{ isZh ? '读取行数' : 'Read rows' }}</div>
                  <div class="value">1,284,532</div>
                  <div class="delta">↑ 100%</div>
                </div>
                <div class="hc-stat">
                  <div class="label">{{ isZh ? '写入行数' : 'Written rows' }}</div>
                  <div class="value">1,284,530</div>
                  <div class="delta">↑ 99.99%</div>
                </div>
                <div class="hc-stat">
                  <div class="label">{{ isZh ? '同步速度' : 'Speed' }}</div>
                  <div class="value">12.4K<span class="unit">rows/s</span></div>
                  <div class="delta">↑ 8.1%</div>
                </div>
              </div>
              <div class="hc-chart">
                <div class="bar" style="height:38%"></div>
                <div class="bar" style="height:52%"></div>
                <div class="bar" style="height:44%"></div>
                <div class="bar" style="height:66%"></div>
                <div class="bar" style="height:58%"></div>
                <div class="bar" style="height:74%"></div>
                <div class="bar" style="height:62%"></div>
                <div class="bar peak" style="height:94%"></div>
                <div class="bar" style="height:80%"></div>
                <div class="bar" style="height:86%"></div>
                <div class="bar" style="height:70%"></div>
                <div class="bar" style="height:82%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== TRUST LOGOS ===================== -->
    <section class="trust">
      <div class="container">
        <p class="trust-label">{{ copy.trustLabel }}</p>
        <div class="trust-logos">
          <div v-for="logo in heroLogos" :key="logo" class="trust-logo">
            <img :src="`/images/logos/${logo}.svg`" :alt="logo" loading="lazy" />
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== FEATURES ===================== -->
    <section class="section features">
      <div class="container">
        <div class="features-head">
          <span class="eyebrow">{{ isZh ? '核心能力' : 'Core capabilities' }}</span>
          <h2 class="h2">{{ isZh ? '一个工具，覆盖数据同步全链路' : 'One tool for the whole sync pipeline' }}</h2>
        </div>
        <div class="feature-grid">
          <a v-for="f in copy.features" :key="f.title" class="feature-card" :href="f.link">
            <div class="fc-icon"><span v-html="featureIcons[f.icon]"></span></div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
            <span class="fc-link">{{ f.linkText }} →</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ===================== CODE SHOWCASE ===================== -->
    <section class="section showcase">
      <div class="container">
        <div class="showcase-grid">
          <div class="showcase-text">
            <span class="eyebrow">{{ copy.codeEyebrow }}</span>
            <h2 class="h2">{{ copy.codeTitle }}</h2>
            <p>{{ copy.codeDesc }}</p>
            <ul class="showcase-list">
              <li v-for="p in copy.codePoints" :key="p.strong">
                <span class="check"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg></span>
                <div><strong>{{ p.strong }}</strong> · <span class="muted">{{ p.text }}</span></div>
              </li>
            </ul>
          </div>
          <div class="code-block">
            <div class="code-head">
              <div class="dots"><span></span><span></span><span></span></div>
              <span class="lang">job.json</span>
            </div>
            <div class="code-body">
              <pre><code v-html="jobJsonHighlighted"></code></pre>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== CONNECTORS ===================== -->
    <section class="section connectors">
      <div class="container">
        <div class="features-head">
          <span class="eyebrow">{{ isZh ? '连接器生态' : 'Connector ecosystem' }}</span>
          <h2 class="h2">{{ copy.connectorsTitle }}</h2>
          <p class="lead">{{ copy.connectorsDesc }}</p>
        </div>
        <div class="connector-groups">
          <div v-for="group in connectorGroups" :key="group.label" class="connector-group">
            <h3 class="connector-group-title">{{ group.label }}</h3>
            <div v-if="group.logos.length" class="connectors-grid">
              <div v-for="item in group.logos" :key="item.name" class="connector-item" :title="item.name">
                <div class="connector-logo-bg">
                  <img :src="`/images/logos/${item.logo}.svg`" :alt="item.name" loading="lazy" />
                </div>
                <span class="connector-name">{{ item.name }}</span>
              </div>
            </div>
            <div v-if="group.texts.length" class="connectors-text-row">
              <span v-for="name in group.texts" :key="name" class="connector-text-badge">
                <span class="badge-dot"></span>{{ name }}
              </span>
            </div>
          </div>
        </div>
        <div class="connectors-cta">
          <a class="btn btn-primary" :href="isZh ? '/introduction' : '/en/introduction'">{{ copy.connectorsCta }} →</a>
        </div>
      </div>
    </section>

    <!-- ===================== WORKFLOW ===================== -->
    <section class="section workflow">
      <div class="container">
        <div class="features-head">
          <span class="eyebrow">{{ isZh ? '快速上手' : 'Get started' }}</span>
          <h2 class="h2">{{ copy.workflowTitle }}</h2>
        </div>
        <div class="workflow-grid">
          <template v-for="(step, i) in copy.workflowSteps" :key="step.num">
            <div class="workflow-step">
              <div class="step-number">{{ step.num }}</div>
              <div class="step-icon" v-html="stepIcons[i]"></div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.desc }}</p>
            </div>
            <div v-if="i < copy.workflowSteps.length - 1" class="workflow-arrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- ===================== GLOBAL STATS ===================== -->
    <section class="global-stats">
      <div class="container">
        <div class="gs-grid">
          <div class="gs-item" v-for="s in copy.stats" :key="s.label">
            <div class="num">{{ s.num }}</div>
            <div class="lab">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== RESOURCES ===================== -->
    <section class="section resources">
      <div class="container">
        <div class="features-head">
          <span class="eyebrow">{{ isZh ? '继续探索' : 'Keep exploring' }}</span>
          <h2 class="h2">{{ copy.resourcesTitle }}</h2>
        </div>
        <div class="resources-grid">
          <a v-for="r in copy.resources" :key="r.title" class="resource-card" :href="r.link">
            <div class="resource-head">
              <span class="resource-icon" v-html="resourceIcons[r.icon]"></span>
              <h3>{{ r.title }}</h3>
            </div>
            <p>{{ r.desc }}</p>
            <span class="resource-arrow">→</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ===================== CTA ===================== -->
    <section class="cta">
      <div class="container">
        <h2>{{ copy.ctaTitle }}</h2>
        <p>{{ copy.ctaDesc }}</p>
        <div class="cta-actions">
          <a class="btn btn-light btn-lg" :href="copy.quickStartLink">{{ copy.ctaPrimary }} →</a>
          <a class="btn btn-ghost-light btn-lg" :href="githubLink">{{ copy.ctaSecondary }}</a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #425466;
  line-height: 1.6;
}
.landing-page :deep(a) { text-decoration: none; }
.container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.section { padding: 96px 0; }
.eyebrow { display: inline-block; font-size: 14px; font-weight: 600; letter-spacing: 0.04em; color: #4573fb; margin-bottom: 12px; }
.h2 { font-size: clamp(1.875rem, 3.5vw, 2.5rem); font-weight: 700; letter-spacing: -0.02em; line-height: 1.15; color: #0A2540; margin: 0; }
.lead { font-size: 1.125rem; color: #425466; margin-top: 16px; max-width: 620px; margin-left: auto; margin-right: auto; }
.features-head { text-align: center; max-width: 680px; margin: 0 auto 64px; }

/* Buttons */
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-family: inherit; font-size: 15px; font-weight: 600; line-height: 1; padding: 11px 18px; border-radius: 4px; border: none; cursor: pointer; transition: all .15s ease; white-space: nowrap; }
.btn-primary { background: #4573fb; color: #fff; box-shadow: 0 4px 14px 0 rgba(69,115,251,0.39); }
.btn-primary:hover { background: #3b6ee0; color: #fff; transform: translateY(-1px); box-shadow: 0 6px 18px 0 rgba(69,115,251,0.5); }
.btn-light { background: #fff; color: #4573fb; }
.btn-light:hover { background: #f6f4ff; color: #3b6ee0; }
.btn-ghost-light { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.4); }
.btn-ghost-light:hover { background: rgba(255,255,255,0.12); color: #fff; }
.btn-lg { padding: 14px 24px; font-size: 16px; }

/* ===== HERO ===== */
.hero { position: relative; padding: 96px 0 80px; overflow: hidden; background: #0A2540; }
.hero-gradient {
  position: absolute; inset: -40% -5% auto -5%; height: 1100px;
  transform: skewY(-11deg); transform-origin: 0;
  background:
    radial-gradient(49% 65% at 50% 35%, rgba(0,212,255,0.95) 0%, rgba(0,212,255,0) 70%),
    radial-gradient(80% 60% at 70% 30%, rgba(69,115,251,0.9) 0%, rgba(69,115,251,0) 60%),
    radial-gradient(60% 80% at 25% 45%, rgba(124,92,255,0.7) 0%, rgba(124,92,255,0) 65%),
    radial-gradient(55% 60% at 85% 65%, rgba(255,89,150,0.5) 0%, rgba(255,89,150,0) 60%),
    linear-gradient(90deg, #0A2540 0%, #1A2B6B 35%, #4573fb 70%, #00D4FF 100%);
}
.hero-glow { position: absolute; top: 8%; left: 50%; transform: translateX(-50%); width: 800px; height: 400px; background: radial-gradient(ellipse at center, rgba(124,92,255,0.4) 0%, transparent 70%); pointer-events: none; }
.hero-content { position: relative; z-index: 2; max-width: 760px; }
.hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.28); color: #fff; font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 999px; margin-bottom: 24px; backdrop-filter: blur(6px); }
.hero-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: #00FFB2; box-shadow: 0 0 8px #00FFB2; }
.hero h1 { color: #fff; font-size: clamp(2.5rem, 5.5vw, 4rem); font-weight: 800; letter-spacing: -0.035em; line-height: 1.08; margin-bottom: 20px; }
.hero h1 .grad { background: linear-gradient(90deg, #00D4FF, #7c5cff 50%, #FF8FD6); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.hero-sub { color: rgba(255,255,255,0.86); font-size: clamp(1.0625rem, 2vw, 1.3125rem); line-height: 1.5; max-width: 600px; margin-bottom: 32px; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 40px; }
.hero-note { color: rgba(255,255,255,0.65); font-size: 14px; display: flex; align-items: center; gap: 6px; }

/* Hero 作业监控浮卡 */
.hero-card { position: relative; z-index: 2; margin-top: 48px; background: #fff; border-radius: 12px; box-shadow: 0 30px 60px -12px rgba(10,37,64,0.45), 0 18px 36px -18px rgba(0,0,0,0.5); overflow: hidden; max-width: 980px; }
.hero-card-bar { display: flex; align-items: center; gap: 8px; padding: 14px 18px; border-bottom: 1px solid #E3E8EE; background: #FBFCFE; }
.hero-card-bar .dots { display: flex; gap: 7px; }
.hero-card-bar .dots span { width: 11px; height: 11px; border-radius: 50%; }
.hero-card-bar .dots span:nth-child(1){background:#FF5F57} .hero-card-bar .dots span:nth-child(2){background:#FEBC2E} .hero-card-bar .dots span:nth-child(3){background:#28C840}
.hero-card-bar .url { flex: 1; text-align: center; font-size: 13px; color: #8898AA; font-family: 'SF Mono','Fira Code',Consolas,monospace; background: #fff; border: 1px solid #E3E8EE; border-radius: 6px; padding: 5px 12px; max-width: 320px; margin: 0 auto; }
.hero-card-body { display: grid; grid-template-columns: 240px 1fr; min-height: 420px; }
.hc-side { background: #F6F9FC; border-right: 1px solid #E3E8EE; padding: 20px; }
.hc-side h5 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #8898AA; margin-bottom: 12px; font-weight: 700; }
.hc-side ul li { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 6px; font-size: 13px; font-weight: 500; color: #425466; cursor: pointer; transition: background .15s; }
.hc-side ul li:hover { background: #EDF2F7; }
.hc-side ul li.active { background: #fff; color: #4573fb; box-shadow: 0 1px 2px rgba(50,50,93,0.08); }
.hc-side ul li .ic { width: 16px; height: 16px; border-radius: 4px; flex-shrink: 0; }
.hc-main { padding: 24px; }
.hc-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.hc-top h3 { font-size: 18px; color: #0A2540; font-weight: 700; }
.hc-top p { font-size: 13px; color: #8898AA; margin-top: 2px; }
.hc-tag { font-size: 12px; font-weight: 600; color: #00C896; background: #E6FFF8; padding: 4px 10px; border-radius: 999px; display: inline-flex; align-items: center; gap: 5px; }
.hc-tag::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #00C896; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
.hc-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 24px; }
.hc-stat { border: 1px solid #E3E8EE; border-radius: 8px; padding: 16px; }
.hc-stat .label { font-size: 12px; color: #8898AA; font-weight: 500; margin-bottom: 4px; }
.hc-stat .value { font-size: 22px; font-weight: 700; color: #0A2540; letter-spacing: -0.02em; }
.hc-stat .value .unit { font-size: 12px; font-weight: 500; color: #8898AA; margin-left: 3px; }
.hc-stat .delta { font-size: 12px; font-weight: 600; color: #00C896; margin-top: 4px; }
.hc-chart { border: 1px solid #E3E8EE; border-radius: 8px; padding: 20px; height: 160px; display: flex; align-items: flex-end; gap: 6px; }
.hc-chart .bar { flex: 1; background: linear-gradient(180deg, #7c5cff, #4573fb); border-radius: 4px 4px 0 0; opacity: 0.85; transition: opacity .2s; }
.hc-chart .bar:hover { opacity: 1; }
.hc-chart .bar.peak { background: linear-gradient(180deg, #00D4FF, #4573fb); }

/* ===== TRUST ===== */
.trust { padding: 64px 0; border-bottom: 1px solid #E3E8EE; }
.trust-label { text-align: center; font-size: 14px; font-weight: 600; color: #8898AA; margin-bottom: 32px; }
.trust-logos { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 40px; }
.trust-logo { height: 44px; display: flex; align-items: center; justify-content: center; opacity: 0.55; transition: opacity .2s; padding: 0 10px; }
.trust-logo:hover { opacity: 1; }
.trust-logo img { height: 36px; width: auto; max-width: 130px; object-fit: contain; }

/* ===== FEATURES ===== */
.features { background: #fff; }
.feature-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
.feature-card { background: #fff; border: 1px solid #E3E8EE; border-radius: 12px; padding: 32px; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease; display: block; color: inherit; }
.feature-card:hover { transform: translateY(-4px); box-shadow: 0 13px 27px -5px rgba(50,50,93,0.15), 0 8px 16px -8px rgba(0,0,0,0.2); border-color: transparent; }
.fc-icon { width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; background: #F6F4FF; color: #4573fb; }
.fc-icon svg { width: 26px; height: 26px; }
.feature-card h3 { font-size: 1.25rem; font-weight: 700; color: #0A2540; margin: 0 0 12px; letter-spacing: -0.02em; }
.feature-card p { font-size: 15px; line-height: 1.55; color: #425466; margin: 0 0 16px; }
.fc-link { font-size: 15px; font-weight: 600; color: #4573fb; }

/* ===== SHOWCASE / CODE ===== */
.showcase { background: #F6F9FC; }
.showcase-grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: 64px; align-items: center; }
.showcase-text .eyebrow { color: #4573fb; }
.showcase-text h2 { margin-bottom: 16px; }
.showcase-text p { color: #425466; margin-bottom: 20px; font-size: 16px; }
.showcase-list { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; list-style: none; padding: 0; }
.showcase-list li { display: flex; gap: 12px; align-items: flex-start; font-size: 15px; color: #0A2540; }
.showcase-list .check { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: #4573fb; display: flex; align-items: center; justify-content: center; margin-top: 1px; }
.showcase-list .check svg { width: 12px; height: 12px; }
.showcase-list strong { font-weight: 600; }
.showcase-list .muted { color: #425466; font-weight: 400; }

.code-block { background: #0A2540; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 50px -10px rgba(50,50,93,0.3), 0 12px 24px -8px rgba(0,0,0,0.25); font-family: 'SF Mono','Fira Code','JetBrains Mono',Consolas,monospace; font-size: 13.5px; line-height: 1.7; }
.code-head { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.08); }
.code-head .lang { font-size: 12px; font-weight: 600; color: #7c5cff; background: rgba(124,92,255,0.15); padding: 3px 10px; border-radius: 999px; margin-left: auto; }
.code-head .dots { display: flex; gap: 6px; }
.code-head .dots span { width: 10px; height: 10px; border-radius: 50%; }
.code-head .dots span:nth-child(1){background:#FF5F57} .code-head .dots span:nth-child(2){background:#FEBC2E} .code-head .dots span:nth-child(3){background:#28C840}
.code-body { padding: 20px; overflow-x: auto; }
.code-body pre { margin: 0; }
.code-body code { color: #E3E8EE; }
:deep(.tok-key) { color: #c792ea; }
:deep(.tok-str) { color: #c3e88d; }
:deep(.tok-num) { color: #f78c6c; }
:deep(.tok-punc) { color: #89ddff; }

/* ===== CONNECTORS ===== */
.connectors { background: #fff; }
.connector-groups { display: flex; flex-direction: column; gap: 40px; }
.connector-group-title { font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: #8898AA; margin-bottom: 16px; }
.connectors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(116px,1fr)); gap: 14px; }
.connector-item { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 20px 12px; border-radius: 14px; background: #F6F9FC; border: 1px solid #E3E8EE; transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
.connector-item:hover { transform: translateY(-3px); border-color: #4573fb; box-shadow: 0 8px 24px rgba(69,115,251,0.12); background: #fff; }
.connector-logo-bg { width: 100%; height: 56px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: #fff; border: 1px solid #E3E8EE; padding: 10px 14px; }
.connector-logo-bg img { max-height: 36px; max-width: 100%; width: auto; height: auto; object-fit: contain; }
.connector-name { font-size: 13px; font-weight: 500; color: #425466; }
.connectors-text-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
.connector-text-badge { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 12px; font-size: 13px; font-weight: 500; color: #425466; background: #F6F9FC; border: 1px solid #E3E8EE; transition: transform .2s, border-color .2s; }
.connector-text-badge:hover { transform: translateY(-2px); border-color: #4573fb; }
.badge-dot { width: 8px; height: 8px; border-radius: 50%; background: #4573fb; opacity: 0.6; }
.connectors-cta { text-align: center; margin-top: 48px; }

/* ===== WORKFLOW ===== */
.workflow { background: #F6F9FC; }
.workflow-grid { display: grid; grid-template-columns: 1fr; gap: 20px; align-items: center; }
.workflow-step { position: relative; padding: 32px 28px; border-radius: 18px; background: #fff; border: 1px solid #E3E8EE; transition: transform .2s ease, box-shadow .2s ease; }
.workflow-step:hover { transform: translateY(-2px); box-shadow: 0 13px 27px -5px rgba(50,50,93,0.12); }
.step-number { position: absolute; top: 16px; right: 22px; font-size: 40px; font-weight: 800; line-height: 1; letter-spacing: -2px; background: linear-gradient(135deg, #4573fb, #00d4ff); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; opacity: 0.85; }
.step-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: rgba(69,115,251,0.12); margin-bottom: 18px; color: #4573fb; }
.step-icon svg { width: 24px; height: 24px; }
.workflow-step h3 { font-size: 20px; font-weight: 600; color: #0A2540; margin: 0 0 8px; }
.workflow-step p { font-size: 14px; line-height: 1.6; color: #425466; margin: 0; }
.workflow-arrow { display: none; color: #4573fb; opacity: 0.7; }
@media (min-width: 768px) {
  .workflow-grid { grid-template-columns: 1fr auto 1fr auto 1fr; gap: 16px; }
  .workflow-arrow { display: flex; align-items: center; justify-content: center; }
  .workflow-arrow svg { width: 24px; height: 24px; }
}

/* ===== GLOBAL STATS ===== */
.global-stats { background: #0A2540; color: #fff; padding: 64px 0; position: relative; overflow: hidden; }
.global-stats::before { content: ''; position: absolute; inset: 0; background: radial-gradient(60% 80% at 80% 20%, rgba(69,115,251,0.25), transparent 60%), radial-gradient(50% 70% at 10% 80%, rgba(0,212,255,0.18), transparent 60%); }
.global-stats .container { position: relative; z-index: 1; }
.gs-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 32px; }
.gs-item { text-align: center; }
.gs-item .num { font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; letter-spacing: -0.03em; background: linear-gradient(120deg, #00D4FF, #7c5cff 60%, #FF8FD6); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; }
.gs-item .lab { font-size: 14px; color: rgba(255,255,255,0.7); margin-top: 12px; }

/* ===== RESOURCES ===== */
.resources { background: #fff; }
.resources-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
@media (min-width: 640px) { .resources-grid { grid-template-columns: repeat(2,1fr); } }
.resource-card { position: relative; display: block; padding: 28px; border-radius: 16px; background: #F6F9FC; border: 1px solid #E3E8EE; color: inherit; transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; overflow: hidden; }
.resource-card::after { content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 3px; background: linear-gradient(180deg, #4573fb, #00d4ff); opacity: 0.35; transition: opacity .2s; }
.resource-card:hover { transform: translateY(-3px); border-color: rgba(69,115,251,0.4); box-shadow: 0 12px 32px rgba(69,115,251,0.08); }
.resource-card:hover::after { opacity: 0; }
.resource-head { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
.resource-icon { flex-shrink: 0; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: rgba(69,115,251,0.12); color: #4573fb; }
.resource-icon svg { width: 20px; height: 20px; }
.resource-card h3 { font-size: 20px; font-weight: 600; color: #0A2540; margin: 0; }
.resource-card p { font-size: 14px; line-height: 1.6; color: #425466; margin: 0; }
.resource-arrow { position: absolute; bottom: 24px; right: 24px; font-size: 18px; color: #4573fb; opacity: 0; transform: translateX(-4px); transition: opacity .2s, transform .2s; }
.resource-card:hover .resource-arrow { opacity: 1; transform: translateX(0); }

/* ===== CTA ===== */
.cta { position: relative; overflow: hidden; background: #0A2540; padding: 96px 0; text-align: center; }
.cta::before { content: ''; position: absolute; inset: 0; background: radial-gradient(50% 70% at 30% 30%, rgba(69,115,251,0.4), transparent 60%), radial-gradient(50% 70% at 75% 60%, rgba(0,212,255,0.3), transparent 60%), radial-gradient(60% 80% at 50% 50%, rgba(124,92,255,0.35), transparent 65%); }
.cta .container { position: relative; z-index: 1; }
.cta h2 { color: #fff; font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; letter-spacing: -0.03em; margin: 0 0 16px; }
.cta p { color: rgba(255,255,255,0.82); font-size: 1.1875rem; max-width: 560px; margin: 0 auto 32px; }
.cta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

/* ===== RESPONSIVE ===== */
@media (max-width: 960px) {
  .showcase-grid { grid-template-columns: 1fr; gap: 40px; }
  .feature-grid { grid-template-columns: repeat(2,1fr); }
  .gs-grid { grid-template-columns: repeat(2,1fr); gap: 32px; }
  .hero-card-body { grid-template-columns: 1fr; }
  .hc-side { display: none; }
  .section { padding: 64px 0; }
}
@media (max-width: 640px) {
  .feature-grid { grid-template-columns: 1fr; }
  .gs-grid { grid-template-columns: 1fr 1fr; }
  .hc-stats { grid-template-columns: 1fr; }
  .hero-card-bar .url { display: none; }
  .cta { padding: 64px 0; }
}
</style>
