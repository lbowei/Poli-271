# 工厂接单网站（英文 B2B）· 使用说明

纯静态网站，只有 3 个文件：`index.html`（内容）、`styles.css`（样式）、`main.js`（菜单和表单）。不需要服务器、数据库或构建工具。

## 1. 先确认内容（草稿模式）

页面顶部有黄色草稿横幅，所有**需要你们确认的数字和说法**都有琥珀色虚线下划线。在 `index.html` 里搜 `class="tbd"` 就能全部找到：

| 位置 | 现在写的（推测） | 改成你们的真实情况 |
|---|---|---|
| 首屏、MOQ 表 | 每款 100–300 条起订 | 真实起订量 |
| 首屏、流程 | 打样 7–10 天，大货 25–40 天 | 真实交期 |
| 工厂数据 | 月产能约 8,000 条 | 真实产能（宁可写保守） |
| 生产能力 | 面料克重、洗水种类、裙子/外套 | 实际能做的 |
| 品控 | AQL 2.5 | 实际标准 |
| 付款/贸易条款 | 30/70 T/T，FOB/EXW/DDP | 实际条款 |
| 合规 | 非新疆棉、标签服务 | **落实面料厂的溯源文件之后再写** |
| 联系方式 | sales@your-domain.com，WhatsApp | 真实邮箱和号码 |

已经从审核报告核实过、可以直接用的：2017 年成立、新塘地址、各道自有工序、amfori BSCI（TÜV 莱茵，2025-12）、排污登记有效到 2030。

全部确认后，把 `<body class="draft">` 改成 `<body>`，横幅和下划线就会消失。

**品牌名** "Hongjue Denim" 是我按「宏爵」暂定的，可以换成你们喜欢的英文名。要改的地方有：`<title>`、页头 wordmark、页脚、JSON-LD。

## 2. 换上照片

「Inside the factory」部分有 6 个占位格。拍好照片后放进 `images/` 文件夹，把对应的

```html
<li class="photo"><span>Cutting room</span></li>
```

改成

```html
<li class="photo"><img src="images/cutting.jpg" alt="Cutting room"><span>Cutting room</span></li>
```

**不要用审核报告里的照片**：拍到了工人，画质也不适合对外。

## 3. 接收询盘表单

1. 去 [formspree.io](https://formspree.io) 注册（免费版每月 50 条）并新建一个表单，会得到类似 `xyzabcd` 的 ID。
2. 在 `index.html` 里把 `https://formspree.io/f/YOUR_FORM_ID` 中的 `YOUR_FORM_ID` 换成这个 ID。
3. 之后客户提交的询盘会发到你们的邮箱。

没配置之前，点「Send inquiry」会打开访客的邮件客户端，内容已经填好，收件人是 `data-fallback-email` 里的地址。

## 4. 上线（免费）

推荐用 **Cloudflare Pages** 或 **Netlify**：注册后把 `website` 文件夹直接拖进去就能发布，然后绑定自己的域名（域名一年约 $10–15）。

用 GitHub Pages 的话：新建一个 **public** 仓库，把这 3 个文件放在根目录，然后在 Settings → Pages 里选 main 分支。

上线后：
- 注册 [Google Search Console](https://search.google.com/search-console)，提交网站，让 Google 收录。
- 在 Google Ads 里把「表单提交」设成转化目标，再开始投 B2B 关键词。

## 5. 本地预览

直接双击 `index.html` 用浏览器打开就行。
