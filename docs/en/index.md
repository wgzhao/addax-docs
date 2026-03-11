---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Addax"
  text: "A stable and efficient heterogeneous data sync tool"
  tagline: Run a full data sync with a single JSON file
  actions:
    - theme: brand
      text: Quickstart
      link: /en/quickstart
    - theme: alt
      text: Documentation
      link: /en/introduce
    - theme: alt
      text: GitHub
      link: https://github.com/wgzhao/addax
  image:
    src: /images/addax_why_new.png
    alt: Addax

features:
  - title: Reliable data quality monitoring
    icon: ✅
    details: Supports strong data types with plugin-specific conversion strategies to preserve data fidelity end-to-end
  - title: Flexible data transformation
    icon: 🔧
    details: Built-in transformations for masking, enrichment, and filtering, plus Groovy functions for custom logic
  - title: High-throughput data transfer
    icon: 🚀
    details: Optimized for large-scale sync with high throughput to deliver data to targets quickly
---
