---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Addax"
  text: "稳定、高效的异构数据源同步工具"
  tagline: 一个 json 文件完成数据同步
  actions:
    - theme: brand
      text: 快速开始
      link: /quick-start
    - theme: alt
      text: 文档
      link: /introduction
    - theme: alt
      text: GitHub
      link: https://github.com/wgzhao/addax
  image:
    src: /images/addax_why_new.png
    alt: Addax

features:
  - title: 可靠的数据质量监控
    icon: ✅
    details: 支持所有的强数据类型，每一种插件都有自己的数据类型转换策略，让数据可以完整无损的传输到目的端
  - title: 丰富的数据转换功能
    icon: 🔧
    details: 提供了丰富数据转换的功能，让数据在传输过程中可以轻松完成数据脱敏，补全，过滤等数据转换功能，另外还提供了自动 `groovy` 函数，让用户自定义转换函数
  - title: 高效的数据传输
    icon: 🚀
    details: Addax 提供了高效的数据传输能力，支持大规模数据的快速同步，确保数据在最短时间内到达目的端
---

