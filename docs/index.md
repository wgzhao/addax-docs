---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Addax"
  text: "异构数据源同步工具"
  tagline: 用一份 JSON 配置，把"读取 → 转换 → 写入"变成可复用、可运维的同步作业
  actions:
    - theme: brand
      text: 快速开始
      link: /quick-start
    - theme: alt
      text: GitHub
      link: https://github.com/wgzhao/addax

features:
  - title: 丰富的连接器生态
    icon: |
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="2"></circle>
        <path d="M5 5L7 7"></path>
        <path d="M19 5L17 7"></path>
        <path d="M5 19L7 17"></path>
        <path d="M19 19L17 17"></path>
        <path d="M12 2v3"></path>
        <path d="M12 19v3"></path>
        <path d="M2 12h3"></path>
        <path d="M19 12h3"></path>
      </svg>
    details: 内置 70+ 读写插件，覆盖 MySQL、Oracle、ClickHouse、HDFS、Kafka、HBase、MongoDB 等主流数据源，开箱即用。
    link: /introduction
    linkText: 查看支持的数据源 →
  - title: 强大的数据转换能力
    icon: |
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 7h4l-4 10"></path>
        <path d="M14 7l4 10h-4l4-10"></path>
        <path d="M9 17h6"></path>
        <path d="M9 7h6"></path>
      </svg>
    details: 内置脱敏、补全、过滤与类型转换，并支持 Groovy 自定义逻辑，适配真实世界的脏数据场景。
    link: /transformer
    linkText: 了解数据转换 →
  - title: 可观测的运行质量
    icon: |
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 3v18h18"></path>
        <path d="M7 14l4-4 4 4 5-6"></path>
        <circle cx="7" cy="14" r="1.5"></circle>
        <circle cx="11" cy="10" r="1.5"></circle>
        <circle cx="15" cy="14" r="1.5"></circle>
      </svg>
    details: 强类型数据传输配合统计报告，让你更快定位"是数据问题还是配置问题"。
    link: /statistic-report
    linkText: 查看统计报告 →
---

<LandingExtras />
