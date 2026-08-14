<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const isZh = computed(() => lang.value.startsWith('zh'))

// Connectors grouped by category for faster scannability
const connectorGroups = computed(() => [
  {
    label: isZh.value ? '关系型数据库' : 'Relational databases',
    logos: [
      { name: 'MySQL', logo: 'mysql' },
      { name: 'PostgreSQL', logo: 'postgresql' },
      { name: 'SQL Server', logo: 'sqlserver' },
      { name: 'DB2', logo: 'db2' },
      { name: 'Greenplum', logo: 'greenplum' },
      { name: 'SQLite', logo: 'sqlite' },
    ],
    texts: ['Oracle', 'Sybase', 'Access', 'DBF'],
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
    ],
    texts: ['HDFS', 'FTP', 'Excel', 'JSON', 'HTTP'],
  },
  {
    label: isZh.value ? '时序与消息流' : 'Time-series & streaming',
    logos: [
      { name: 'TDengine', logo: 'tdengine' },
      { name: 'InfluxDB', logo: 'influxdata' },
      { name: 'Kafka', logo: 'kafka' },
    ],
    texts: ['Stream'],
  },
])

const copy = computed(() => {
  if (isZh.value) {
    return {
      stats: [
        { num: '70+', label: '读写插件' },
        { num: '30+', label: '数据源类型' },
        { num: 'Apache 2.0', label: '开源协议' },
        { num: '强类型', label: '数据传输' },
      ],
      codeTitle: '一份 JSON，搞定数据同步',
      codeDesc: '声明式配置 reader 和 writer，无需编写代码即可完成异构数据源之间的数据同步。',
      connectorsTitle: '覆盖主流数据源',
      connectorsDesc: '内置 70+ 读写插件，从关系型数据库到 NoSQL，从文件系统到消息队列，满足绝大多数数据同步场景。',
      connectorsCta: '查看全部插件',
      workflowTitle: '三步开始数据同步',
      workflowStep1: '安装 Addax',
      workflowStep1Desc: '通过 Docker、一键脚本或源码编译安装，几分钟内即可就绪。',
      workflowStep2: '编写作业 JSON',
      workflowStep2Desc: '选择 reader 和 writer 插件，配置连接信息和字段映射。',
      workflowStep3: '运行并监控',
      workflowStep3Desc: '通过 CLI 运行作业，查看统计报告，按需调试。',
      resourcesTitle: '深入了解 Addax',
      resources: [
        { title: '项目简介', desc: '了解 Addax 的设计理念和核心架构', link: '/introduction', icon: 'book' },
        { title: '快速开始', desc: '几分钟内完成安装并运行第一个同步任务', link: '/quick-start', icon: 'rocket' },
        { title: '作业配置', desc: '学习 JSON 作业文件的编写规范和最佳实践', link: '/job-setup', icon: 'code' },
        { title: '插件开发', desc: '为 Addax 开发自定义 reader 或 writer 插件', link: '/plugin-development', icon: 'puzzle' },
      ],
      ctaTitle: '开始构建你的数据同步管道',
      ctaDesc: '几分钟内安装 Addax，用一份 JSON 配置跑通第一个同步作业。',
      ctaPrimary: '快速开始',
      ctaSecondary: 'GitHub',
      quickStartLink: '/quick-start',
    }
  }
  return {
    stats: [
      { num: '70+', label: 'Reader/writer plugins' },
      { num: '30+', label: 'Data source types' },
      { num: 'Apache 2.0', label: 'Open source license' },
      { num: 'Strong-typed', label: 'Data transport' },
    ],
    codeTitle: 'One JSON file. That\'s all it takes.',
    codeDesc: 'Declare reader and writer plugins in JSON — no code needed to sync data between heterogeneous sources.',
    connectorsTitle: 'Connect to your stack',
    connectorsDesc: '70+ built-in plugins covering RDBMS, NoSQL, file systems, and message queues for virtually any sync scenario.',
    connectorsCta: 'View all plugins',
    workflowTitle: 'Get started in 3 steps',
    workflowStep1: 'Install Addax',
    workflowStep1Desc: 'Quick setup via Docker, one-line script, or build from source.',
    workflowStep2: 'Write a job JSON',
    workflowStep2Desc: 'Pick reader/writer plugins, configure connections and column mappings.',
    workflowStep3: 'Run and monitor',
    workflowStep3Desc: 'Run via CLI, check stats reports, and debug as needed.',
    resourcesTitle: 'Dive deeper into Addax',
    resources: [
      { title: 'Introduction', desc: 'Learn about Addax design philosophy and core architecture', link: '/en/introduction', icon: 'book' },
      { title: 'Quick Start', desc: 'Install and run your first sync job in minutes', link: '/en/quick-start', icon: 'rocket' },
      { title: 'Job Setup', desc: 'Learn JSON job file conventions and best practices', link: '/en/job-setup', icon: 'code' },
      { title: 'Plugin Development', desc: 'Build custom reader or writer plugins for Addax', link: '/en/plugin-development', icon: 'puzzle' },
    ],
    ctaTitle: 'Start building your data pipeline',
    ctaDesc: 'Install Addax in minutes and run your first sync job with a single JSON file.',
    ctaPrimary: 'Quick Start',
    ctaSecondary: 'GitHub',
    quickStartLink: '/en/quick-start',
  }
})

// JSON with syntax-highlight markup (Material theme token colors via custom.css)
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

const stepIcons = [
  // install
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  // write
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>`,
  // run
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
  <!-- Stats Bar -->
  <section class="stats-section">
    <div class="stats-grid">
      <div class="stat-item" v-for="item in copy.stats" :key="item.label">
        <div class="stat-num">{{ item.num }}</div>
        <div class="stat-label">{{ item.label }}</div>
      </div>
    </div>
  </section>

  <!-- Code Example Section -->
  <section class="landing-section">
    <div class="section-header">
      <h2>{{ copy.codeTitle }}</h2>
      <p>{{ copy.codeDesc }}</p>
    </div>
    <div class="code-block-wrapper">
      <div class="code-block-header">
        <span class="code-dot red"></span>
        <span class="code-dot yellow"></span>
        <span class="code-dot green"></span>
        <span class="code-filename">job.json</span>
      </div>
      <pre class="code-block"><code v-html="jobJsonHighlighted"></code></pre>
    </div>
  </section>

  <!-- Connectors Showcase -->
  <section class="landing-section connectors-section">
    <div class="section-header">
      <h2>{{ copy.connectorsTitle }}</h2>
      <p>{{ copy.connectorsDesc }}</p>
    </div>
    <div class="connectors-grid-wrap">
      <div
        v-for="group in connectorGroups"
        :key="group.label"
        class="connector-group"
      >
        <h3 class="connector-group-title">{{ group.label }}</h3>
        <div v-if="group.logos.length" class="connectors-grid">
          <div
            v-for="item in group.logos"
            :key="item.name"
            class="connector-item"
            :title="item.name"
          >
            <div class="connector-logo-bg">
              <img
                :src="`/images/logos/${item.logo}.svg`"
                :alt="item.name"
                loading="lazy"
                width="48"
                height="48"
              />
            </div>
            <span class="connector-name">{{ item.name }}</span>
          </div>
        </div>
        <div v-if="group.texts.length" class="connectors-text-row">
          <span
            v-for="name in group.texts"
            :key="name"
            class="connector-text-badge"
          ><span class="badge-dot"></span>{{ name }}</span>
        </div>
      </div>
    </div>
    <div class="connectors-cta">
      <a class="VPButton medium brand" :href="isZh ? '/introduction' : '/en/introduction'">
        {{ copy.connectorsCta }} →
      </a>
    </div>
  </section>

  <!-- Workflow Steps -->
  <section class="landing-section">
    <div class="section-header">
      <h2>{{ copy.workflowTitle }}</h2>
    </div>
    <div class="workflow-grid">
      <div class="workflow-step">
        <div class="step-number">01</div>
        <div class="step-icon" v-html="stepIcons[0]" />
        <h3>{{ copy.workflowStep1 }}</h3>
        <p>{{ copy.workflowStep1Desc }}</p>
      </div>
      <div class="workflow-arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>
      <div class="workflow-step">
        <div class="step-number">02</div>
        <div class="step-icon" v-html="stepIcons[1]" />
        <h3>{{ copy.workflowStep2 }}</h3>
        <p>{{ copy.workflowStep2Desc }}</p>
      </div>
      <div class="workflow-arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>
      <div class="workflow-step">
        <div class="step-number">03</div>
        <div class="step-icon" v-html="stepIcons[2]" />
        <h3>{{ copy.workflowStep3 }}</h3>
        <p>{{ copy.workflowStep3Desc }}</p>
      </div>
    </div>
  </section>

  <!-- Resources / Quick Links -->
  <section class="landing-section resources-section">
    <div class="section-header">
      <h2>{{ copy.resourcesTitle }}</h2>
    </div>
    <div class="resources-grid">
      <a
        v-for="item in copy.resources"
        :key="item.title"
        class="resource-card"
        :href="item.link"
      >
        <div class="resource-head">
          <span class="resource-icon" v-html="resourceIcons[item.icon]" />
          <h3>{{ item.title }}</h3>
        </div>
        <p>{{ item.desc }}</p>
        <span class="resource-arrow">→</span>
      </a>
    </div>
  </section>

  <!-- Final CTA -->
  <section class="cta-section">
    <div class="cta-inner">
      <h2>{{ copy.ctaTitle }}</h2>
      <p>{{ copy.ctaDesc }}</p>
      <div class="cta-actions">
        <a class="VPButton medium brand" :href="copy.quickStartLink">
          {{ copy.ctaPrimary }} →
        </a>
        <a class="VPButton medium alt" :href="githubLink">
          {{ copy.ctaSecondary }}
        </a>
      </div>
    </div>
  </section>
</template>
