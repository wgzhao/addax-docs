import { h, nextTick, watch } from "vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { useData } from "vitepress";
import { createMermaidRenderer } from "vitepress-mermaid-renderer";
import LandingPage from "./components/LandingPage.vue";
import VersionSwitcher from "@viteplus/versions/components/version-switcher.component.vue";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx);
    ctx.app.component("LandingPage", LandingPage);
    ctx.app.component("VersionSwitcher", VersionSwitcher);
  },
  Layout: () => {
    const { isDark, localeIndex } = useData();

    const initMermaid = () => {
      const renderer = createMermaidRenderer({
        theme: isDark.value ? "dark" : "forest",
        startOnLoad: false,
        flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
        },
      });

      // `toolbar` is not a constructor option in 1.2; it is applied through
      // setToolbar(). This also turns on downloads and the collapsible mobile
      // toolbar, and localizes the tooltips to the current locale.
      renderer.setToolbar({
        downloadFormat: 'svg',
        desktop: { download: 'enabled' },
        mobile: { download: 'enabled', toggleToolbar: 'enabled', collapsed: 'collapsed' },
        fullscreen: { download: 'enabled' },
        i18n: {
          localeIndex: localeIndex.value,
          locales: {
            root: {
              tooltips: {
                zoomIn: '放大',
                zoomOut: '缩小',
                resetView: '重置视图',
                copyCode: '复制图表代码',
                toggleFullscreen: '全屏查看',
                download: '下载图表',
                copyCodeCopied: '已复制',
                renderErrorText: '图表渲染失败',
                toggleErrorDetailsText: '显示错误详情',
                toggleErrorDetailsHideText: '隐藏错误详情',
                toggleToolbarExpand: '展开工具栏',
                toggleToolbarCollapse: '收起工具栏',
              },
            },
            en: {
              tooltips: {
                zoomIn: 'Zoom in',
                zoomOut: 'Zoom out',
                resetView: 'Reset view',
                copyCode: 'Copy diagram code',
                toggleFullscreen: 'Toggle fullscreen',
                download: 'Download diagram',
                copyCodeCopied: 'Copied',
                renderErrorText: 'Diagram failed to render',
                toggleErrorDetailsText: 'Show error details',
                toggleErrorDetailsHideText: 'Hide error details',
                toggleToolbarExpand: 'Expand toolbar',
                toggleToolbarCollapse: 'Collapse toolbar',
              },
            },
          },
        },
      });
    };

    // initial mermaid setup
    nextTick(() => initMermaid());

    // on theme change, re-render mermaid charts
    watch(
      () => isDark.value,
      () => {
        initMermaid();
      },
    );

    return h(DefaultTheme.Layout);
  },
} satisfies Theme;
