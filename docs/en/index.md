---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Addax"
  text: "A stable and efficient heterogeneous data sync tool"
  tagline: Define read → transform → write as a single JSON job, and operate it like an engineering artifact
  actions:
    - theme: brand
      text: Quickstart
      link: /en/quick-start
    - theme: alt
      text: Documentation
      link: /en/introduction
    - theme: alt
      text: GitHub
      link: https://github.com/wgzhao/addax
  image:
    src: /images/addax_why_new.png
    alt: Addax

features:
  - title: Observability for data quality
    icon: |
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z"></path>
        <path d="M9 12l2 2 4-5"></path>
      </svg>
    details: Strong typing + stats reports help you quickly separate data issues from configuration issues.
    link: /en/statistic-report
    linkText: Open stats report
  - title: Built-in transforms (plus Groovy)
    icon: |
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 20l10-10"></path>
        <path d="M9 21l-6-6"></path>
        <path d="M15 4V2"></path>
        <path d="M15 16v-2"></path>
        <path d="M8 9h2"></path>
        <path d="M20 9h2"></path>
      </svg>
    details: Mask, filter, enrich, and cast types with built-in transformers, or write Groovy for custom logic.
    link: /en/transformer
    linkText: Learn transforms
  - title: Operable, high-throughput sync
    icon: |
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 13a8 8 0 0 1 16 0"></path>
        <path d="M12 9l3 3-6 6"></path>
        <path d="M9 12l3 3"></path>
      </svg>
    details: Define the job once, run via CLI anywhere—ideal for CI/CD, schedulers, and standardized operations.
    link: /en/job-setup
    linkText: Start with job setup
---

<LandingExtras />
