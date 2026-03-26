---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Addax"
  text: "稳定、高效的异构数据源同步工具"
  tagline: 用一份 JSON，把“读取 → 转换 → 写入”变成可复用、可运维的同步作业
  actions:
    - theme: brand
      text: 快速开始
      link: /quick-start
    - theme: alt
      text: 阅读文档
      link: /introduction
    - theme: alt
      text: GitHub
      link: https://github.com/wgzhao/addax
  image:
    src: /images/addax_why_new.png
    alt: Addax

features:
  - title: 可靠的数据质量与可观测性
    icon: |
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z"></path>
        <path d="M9 12l2 2 4-5"></path>
      </svg>
    details: 强类型数据传输 + 统计报告，让你更快定位“是数据问题还是配置问题”。
    link: /statistic-report
    linkText: 查看统计报告
  - title: 丰富的数据转换能力
    icon: |
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 20l10-10"></path>
        <path d="M9 21l-6-6"></path>
        <path d="M15 4V2"></path>
        <path d="M15 16v-2"></path>
        <path d="M8 9h2"></path>
        <path d="M20 9h2"></path>
      </svg>
    details: 内置脱敏、补全、过滤与类型转换，并支持 Groovy 自定义逻辑，适配真实世界的脏数据。
    link: /transformer
    linkText: 了解数据转换
  - title: 高吞吐、易落地
    icon: |
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 13a8 8 0 0 1 16 0"></path>
        <path d="M12 9l3 3-6 6"></path>
        <path d="M9 12l3 3"></path>
      </svg>
    details: 用一份 JSON 定义同步作业，通过 CLI 运行，适合在 CI/CD、定时任务或运维平台中标准化落地。
    link: /job-setup
    linkText: 从作业配置开始
---

<LandingExtras />
