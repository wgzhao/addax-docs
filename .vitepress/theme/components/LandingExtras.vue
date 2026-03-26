<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { lang } = useData()
const isZh = computed(() => lang.value.startsWith('zh'))

const copy = computed(() => {
  if (isZh.value) {
    return {
      sectionTitle: '把“同步任务”写成可审计的配置',
      sectionDesc:
        '以 JSON 描述读取、转换与写入，让任务具备可复用、可评审、可回滚的工程属性。',
      ctaPrimary: '快速开始',
      ctaSecondary: '作业配置',
      ctaTertiary: '数据转换',
      kpi1Value: '70+',
      kpi1Label: '读写插件',
      kpi2Value: '1',
      kpi2Label: '份 JSON 作业',
      kpi3Value: 'CLI',
      kpi3Label: '命令行运行',
      kpi4Value: 'Docs',
      kpi4Label: '生产实践指南',
      stepsTitle: '典型工作流',
      step1Title: '定义作业',
      step1Desc: '选择 reader/writer，补齐连接信息与字段映射。',
      step2Title: '添加转换',
      step2Desc: '脱敏、过滤、补全、类型转换，用最小成本应对脏数据。',
      step3Title: '运行与排障',
      step3Desc: '查看统计报告，按步骤调试，快速定位数据与配置问题。',
      mediaTitle: '覆盖主流数据源',
      mediaDesc:
        '内置大量连接器，既能对接传统 RDBMS，也能对接常见 NoSQL 与数据湖生态。',
      quickLinksTitle: '常用入口',
      linkIntro: '项目简介',
      linkDebug: '调试指南',
      linkStats: '统计报告',
      linkPlugin: '插件开发',
      linkServer: '服务端模式',
      links: {
        quickStart: '/quick-start',
        jobSetup: '/job-setup',
        transformer: '/transformer',
        introduction: '/introduction',
        debug: '/debug',
        stats: '/statistic-report',
        pluginDev: '/plugin-development',
        server: '/server'
      }
    }
  }

  return {
    sectionTitle: 'Turn sync jobs into auditable configuration',
    sectionDesc:
      'Describe read → transform → write as JSON so jobs are reusable, reviewable, and easy to operate.',
    ctaPrimary: 'Quickstart',
    ctaSecondary: 'Job setup',
    ctaTertiary: 'Transforms',
    kpi1Value: '70+',
    kpi1Label: 'Connectors',
    kpi2Value: '1',
    kpi2Label: 'JSON job file',
    kpi3Value: 'CLI',
    kpi3Label: 'Run anywhere',
    kpi4Value: 'Docs',
    kpi4Label: 'Ops playbooks',
    stepsTitle: 'Typical workflow',
    step1Title: 'Define a job',
    step1Desc: 'Pick reader/writer, add connection, and map columns.',
    step2Title: 'Add transforms',
    step2Desc: 'Mask, filter, enrich, and cast types to handle messy inputs.',
    step3Title: 'Run & debug',
    step3Desc: 'Use stats reports and the debug guide to pinpoint issues fast.',
    mediaTitle: 'Connect to your stack',
    mediaDesc:
      'A large set of built-in plugins covers mainstream RDBMS, common NoSQL, and data-lake ecosystems.',
    quickLinksTitle: 'Quick links',
    linkIntro: 'Introduction',
    linkDebug: 'Debugging',
    linkStats: 'Stats report',
    linkPlugin: 'Plugin development',
    linkServer: 'Server mode',
    links: {
      quickStart: '/en/quick-start',
      jobSetup: '/en/job-setup',
      transformer: '/en/transformer',
      introduction: '/en/introduction',
      debug: '/en/howto-debug',
      stats: '/en/statistic-report',
      pluginDev: '/en/plugin-development',
      server: '/en/server'
    }
  }
})

const jobJson = computed(() => {
  return `{
  "job": {
    "setting": {
      "speed": { "channel": 4 }
    },
    "content": [{
      "reader": {
        "name": "mysqlreader",
        "parameter": {
          "username": "user",
          "password": "******",
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
          "connection": [{
            "jdbcUrl": "jdbc:clickhouse://host:8123/db",
            "table": ["target_table"]
          }]
        }
      }
    }]
  }
}`
})

const icons = {
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>`,
  wand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 6.2l1.4-1.4"/><path d="M10.8 13.2l1.4-1.4"/><path d="M17.8 11.8l1.4 1.4"/><path d="M10.8 4.8l1.4 1.4"/><path d="M6 20l10-10"/><path d="M9 21l-6-6"/></svg>`,
  bug: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2l1 2h6l1-2"/><path d="M9 9h6"/><path d="M12 11v4"/><path d="M7 13H5"/><path d="M19 13h-2"/><path d="M7 17H5"/><path d="M19 17h-2"/><path d="M8 20l-1 2"/><path d="M16 20l1 2"/><rect x="7" y="5" width="10" height="16" rx="5"/></svg>`
}
</script>

<template>
  <section class="addax-landing">
    <div class="addax-landing-grid">
      <div class="addax-card">
        <div class="addax-card-inner">
          <h2>{{ copy.sectionTitle }}</h2>
          <p>{{ copy.sectionDesc }}</p>

          <div class="addax-actions">
            <a class="VPButton medium brand" :href="copy.links.quickStart">{{ copy.ctaPrimary }}</a>
            <a class="VPButton medium alt" :href="copy.links.jobSetup">{{ copy.ctaSecondary }}</a>
            <a class="VPButton medium alt" :href="copy.links.transformer">{{ copy.ctaTertiary }}</a>
          </div>

          <div class="addax-kpis">
            <div class="addax-kpi">
              <div class="value">{{ copy.kpi1Value }}</div>
              <div class="label">{{ copy.kpi1Label }}</div>
            </div>
            <div class="addax-kpi">
              <div class="value">{{ copy.kpi2Value }}</div>
              <div class="label">{{ copy.kpi2Label }}</div>
            </div>
            <div class="addax-kpi">
              <div class="value">{{ copy.kpi3Value }}</div>
              <div class="label">{{ copy.kpi3Label }}</div>
            </div>
            <div class="addax-kpi">
              <div class="value">{{ copy.kpi4Value }}</div>
              <div class="label">{{ copy.kpi4Label }}</div>
            </div>
          </div>

          <h2 style="margin-top: 20px">{{ copy.stepsTitle }}</h2>
          <div class="addax-steps">
            <a class="addax-step" :href="copy.links.jobSetup">
              <div class="title">
                <span v-html="icons.file" />
                <span>{{ copy.step1Title }}</span>
              </div>
              <p>{{ copy.step1Desc }}</p>
            </a>
            <a class="addax-step" :href="copy.links.transformer">
              <div class="title">
                <span v-html="icons.wand" />
                <span>{{ copy.step2Title }}</span>
              </div>
              <p>{{ copy.step2Desc }}</p>
            </a>
            <a class="addax-step" :href="copy.links.debug">
              <div class="title">
                <span v-html="icons.bug" />
                <span>{{ copy.step3Title }}</span>
              </div>
              <p>{{ copy.step3Desc }}</p>
            </a>
          </div>
        </div>
      </div>

      <div class="addax-card">
        <div class="addax-card-inner">
          <h2>JSON</h2>
          <p>{{ isZh ? '示例作业（可按你的数据源替换 reader/writer）' : 'Example job (swap reader/writer for your stack)' }}</p>
          <div class="addax-code" aria-label="JSON example">
            <pre><code class="language-json">{{ jobJson }}</code></pre>
          </div>

          <h2 style="margin-top: 18px">{{ copy.mediaTitle }}</h2>
          <p>{{ copy.mediaDesc }}</p>
          <div class="addax-media">
            <img
              src="/images/supported_databases.png"
              width="1200"
              height="720"
              loading="lazy"
              :alt="isZh ? '支持的数据源示意图' : 'Supported databases'"
            />
            <img
              src="/images/addax-flowchart.png"
              width="1200"
              height="720"
              loading="lazy"
              :alt="isZh ? 'Addax 工作流示意图' : 'Addax workflow'"
            />
          </div>

          <h2 style="margin-top: 18px">{{ copy.quickLinksTitle }}</h2>
          <div class="addax-actions" style="margin-top: 12px">
            <a class="VPButton medium alt" :href="copy.links.introduction">{{ copy.linkIntro }}</a>
            <a class="VPButton medium alt" :href="copy.links.stats">{{ copy.linkStats }}</a>
            <a class="VPButton medium alt" :href="copy.links.pluginDev">{{ copy.linkPlugin }}</a>
            <a class="VPButton medium alt" :href="copy.links.server">{{ copy.linkServer }}</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
