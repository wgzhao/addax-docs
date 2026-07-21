<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const isZh = computed(() => lang.value.startsWith('zh'))

// Connectors with icon-style logos (square, colorful, recognizable at small sizes)
// Text-only wordmarks like Oracle/SAP are excluded — they become illegible when scaled down
const connectorsWithLogo = [
  { name: 'MySQL', logo: 'mysql' },
  { name: 'PostgreSQL', logo: 'postgresql' },
  { name: 'SQL Server', logo: 'sqlserver' },
  { name: 'ClickHouse', logo: 'clickhouse' },
  { name: 'Doris', logo: 'doris' },
  { name: 'StarRocks', logo: 'starrocks' },
  { name: 'Databend', logo: 'databend' },
  { name: 'MongoDB', logo: 'mongodb' },
  { name: 'Redis', logo: 'redis' },
  { name: 'Elasticsearch', logo: 'elasticsearch' },
  { name: 'Kafka', logo: 'kafka' },
  { name: 'Cassandra', logo: 'cassandra' },
  { name: 'HBase', logo: 'hbase' },
  { name: 'Kudu', logo: 'kudu' },
  { name: 'Iceberg', logo: 'iceberg' },
  { name: 'Paimon', logo: 'paimon' },
  { name: 'MinIO', logo: 'minio' },
  { name: 'Amazon S3', logo: 's3' },
  { name: 'TDengine', logo: 'tdengine' },
  { name: 'InfluxDB', logo: 'influxdata' },
  { name: 'SQLite', logo: 'sqlite' },
  { name: 'DB2', logo: 'db2' },
  { name: 'Greenplum', logo: 'greenplum' },
  { name: 'Hive', logo: 'hive' },
]

// Additional connectors shown as text-only badges (no logo or wordmark-only logo)
const connectorsTextOnly = [
  'Oracle', 'Sybase', 'Excel', 'FTP', 'HDFS',
  'HTTP', 'JSON', 'Stream', 'Access', 'DBF',
]

const copy = computed(() => {
  if (isZh.value) {
    return {
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
        { title: '项目简介', desc: '了解 Addax 的设计理念和核心架构', link: '/introduction' },
        { title: '快速开始', desc: '几分钟内完成安装并运行第一个同步任务', link: '/quick-start' },
        { title: '作业配置', desc: '学习 JSON 作业文件的编写规范和最佳实践', link: '/job-setup' },
        { title: '插件开发', desc: '为 Addax 开发自定义 reader 或 writer 插件', link: '/plugin-development' },
      ],
    }
  }
  return {
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
      { title: 'Introduction', desc: 'Learn about Addax design philosophy and core architecture', link: '/en/introduction' },
      { title: 'Quick Start', desc: 'Install and run your first sync job in minutes', link: '/en/quick-start' },
      { title: 'Job Setup', desc: 'Learn JSON job file conventions and best practices', link: '/en/job-setup' },
      { title: 'Plugin Development', desc: 'Build custom reader or writer plugins for Addax', link: '/en/plugin-development' },
    ],
  }
})

const jobJson = `{
  "job": {
    "content": [{
      "reader": {
        "name": "mysqlreader",
        "parameter": {
          "username": "root",
          "password": "******",
          "column": ["*"],
          "connection": [{
            "jdbcUrl": ["jdbc:mysql://host:3306/db"],
            "table": ["source_table"]
          }]
        }
      },
      "writer": {
        "name": "clickhousewriter",
        "parameter": {
          "username": "default",
          "password": "******",
          "column": ["*"],
          "connection": [{
            "jdbcUrl": "jdbc:clickhouse://host:8123/db",
            "table": ["target_table"]
          }]
        }
      }
    }]
  }
}`

const stepIcons = [
  // install
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  // write
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>`,
  // run
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
]
</script>

<template>
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
      <pre class="code-block"><code>{{ jobJson }}</code></pre>
    </div>
  </section>

  <!-- Connectors Showcase -->
  <section class="landing-section connectors-section">
    <div class="section-header">
      <h2>{{ copy.connectorsTitle }}</h2>
      <p>{{ copy.connectorsDesc }}</p>
    </div>
    <div class="connectors-grid">
      <div
        v-for="item in connectorsWithLogo"
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
    <div class="connectors-text-row">
      <span
        v-for="name in connectorsTextOnly"
        :key="name"
        class="connector-text-badge"
      >{{ name }}</span>
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
        <h3>{{ item.title }}</h3>
        <p>{{ item.desc }}</p>
        <span class="resource-arrow">→</span>
      </a>
    </div>
  </section>
</template>
