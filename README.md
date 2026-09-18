# Addax 文档

Addax 官方文档站，发布在 <https://addax.wgzhao.com>。包含介绍、安装、使用指南、插件开发指南，以中英双语提供。

## 目录结构

| 路径 | 用途 |
| --- | --- |
| `docs/src/` | 当前文档，服务在站点根路径。**日常修改都在这里** |
| `docs/archive/<版本>/` | 冻结的历史版本，服务在 `/<版本>/` |
| `docs/public/` | 图片与 job 样例，**所有版本共用** |
| `.vitepress/` | 站点配置与主题（保留在仓库根，原因见「部署」） |

## 本地开发

```bash
npm install
npm run dev      # 本地预览
npm run build    # 构建，产物在 .vitepress/dist
```

## 发布新版本

当 Addax 发布新版本（例如 6.1.1）后，把当时的文档冻结成一个版本：

**方式一：GitHub Actions（推荐）**

Actions → `Archive documentation` → Run workflow → 填入版本号（如 `6.1.1`）。

它会复制 `docs/src` 到 `docs/archive/6.1.1`、跑一次构建校验，然后提交推送。Cloudflare Pages 检测到推送后自动部署。版本目录已存在时任务会失败，不会覆盖历史。

**方式二：手动等价操作**

```bash
cp -r docs/src docs/archive/6.1.1
npm run build
git add docs/archive/6.1.1
git commit -m "docs: archive the 6.1.1 documentation"
git push
```

两种方式都不需要改配置——版本列表由 `docs/archive/` 下的目录名自动生成。

## 版本模型

- **根路径服务 `docs/src`，对应 addax 项目的 master 分支**，在切换器里显示为 `master`
- 每个已发布版本在 `docs/archive/<版本>/` 下有一份冻结副本
- 中英双语各自的路径是 `/<版本>/...` 与 `/en/<版本>/...`

文档开发和 addax master 同步进行：改动直接提交到 `docs/src`，用户打开站点根路径看到的就是 master 的文档。

> **与旧站（mkdocs + mike）的差异**：旧站 `/Addax/` 会跳转到 `latest` 别名，指向**最新发布版**，master 文档单独放在 `/Addax/develop/`。现在根路径给的是 master 文档，这是一个行为变化。

**为什么 `current` 既不是 `latest` 也不是版本号**：

- **不能是版本号**：`@viteplus/versions` 的版本列表只来自 `archive` 的子目录名，而切换器组件在非当前版本时会额外渲染一次 `currentVersion`。一个同时存在于 archive 中的版本号，会在所有归档页面上重复出现两次。
- **不宜叫 `latest`**：文档站语境里 `latest` 通常指最新发布版，而根路径实际是 master 文档，用这个词会让用户以为自己在读已发布版本。

## 部署

站点由 **Cloudflare Pages** 服务（不是 Vercel）。Cloudflare 的 VitePress 预设固定使用：

```
Build command:   npx vitepress build
Build directory: .vitepress/dist
```

仓库根保留 `.vitepress/` 并在配置里写 `srcDir: 'docs'`，就是为了让这两个值保持默认——`@viteplus/versions` 会把 `srcDir` 折进自己的根路径计算，于是 `sources` / `archive` 正确解析到 `docs/src` 与 `docs/archive`，构建产物也仍然落在 `.vitepress/dist`。**调整目录结构前请先确认不会破坏这两项**，否则部署会静默失败（线上继续跑上一次成功的版本）。

`vercel.json` 也指向同一套命令与产物目录，仅用于另一个同样连着本仓库的 Vercel 项目。

## 注意事项

- **素材是所有版本共用的。** 删除任何被归档页面引用的 `docs/public` 文件都会让构建失败。这是有意设计——宁可构建失败，也不要发出打不开的页面。
- **归档是「当时发布的文档原貌」，不是「该版本的准确文档」。** 文档可能滞后于代码，例如 6.0.12 的归档里仍包含 6.0.11 就已移除的插件页面。
- **`@viteplus/versions` 的 peer 范围是 `^2.0.0`，不匹配本项目使用的 `2.0.0-alpha.16`。** `.npmrc` 里设置了 `legacy-peer-deps=true`，实测可正常工作，但属于「能用」而非「受支持」。升级 VitePress 时请重新验证构建。
- **`mermaid` 是 `vitepress-mermaid-renderer` 的 peer 依赖**，必须显式声明在 `package.json` 中，否则干净安装后构建会失败。
