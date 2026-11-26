# 工厂接单网站（英文 B2B）· 使用说明

这是一个纯静态网站：不需要服务器、数据库或任何框架，可以直接拖到 Cloudflare Pages / Netlify 免费上线。

```
website/
├── index.html              页面内容（所有文字都在这里改）
└── assets/
    ├── css/styles.css      样式
    ├── js/main.js          菜单、滚动动画、"Add to inquiry" 选款、表单
    ├── fonts/              自托管字体（Archivo / Instrument Serif / IBM Plex Mono，均为 SIL OFL 开源字体）
    └── img/                牛仔布水洗小样、背景纹理、favicon、社交分享图 og-image.png
```

## 页面结构

| 板块 | 内容 |
|---|---|
| 首屏 | 标题 + 一张会「自己画出来」的技术款式图（tech flat，带尺寸标注和工艺说明） |
| 信息条 | BSCI 审核、自有工序、起订量、美国单棉花溯源 |
| Who we're for | "Big factories want 3,000 a style. We're built for your first 300." |
| **Fit library** | 6 个基础版型的线稿（直筒、修身锥形、阔腿、弯刀/桶形、喇叭、宽松），每个都能「加入询价单」 |
| **Wash library** | 6 种水洗效果小样，锯齿布边，同样可以加入询价单 |
| Capabilities | 面料、水洗、辅料、开发、品控、包装 |
| Process | 8 周时间轴（甘特图）+ 6 个步骤 |
| Terms | 起订量、交期、付款、贸易条款表；美国关税说明 |
| Why Xintang | 新塘年产能约 3.3 亿条（有来源）、2017 年建厂 |
| Compliance | 4 份文件：BSCI、棉花溯源、排污登记、标签合规 |
| Factory | 生产流程图 + 预约视频验厂 |
| FAQ / 询价表单 | 表单顶部会自动列出客户在上面选过的版型和水洗 |

## 1. 确认内容（草稿模式）

所有我**推测、需要你们确认**的数字和说法，都标了琥珀色虚线下划线。页面右下角有一个 Draft 小标签，显示还剩几项待确认，点 "Hide markers" 可以临时隐藏标记，看看最终效果。

在 `index.html` 里搜 `class="tbd"` 就能找到全部：

| 内容 | 现在写的（推测） |
|---|---|
| 起订量 | 每款 100–300 条，可拆尺码、最多 2 个颜色 |
| 交期 | 打样 7–10 天、大货确认后 25–40 天、总体约 8 周 |
| 产能 | 每月约 8,000 条（宁可写保守） |
| 产品/面料/水洗 | 短裤裙子外套、8–16 oz、再生/有机棉、各类水洗工艺 |
| 品控 | AQL 2.5 |
| 付款/贸易条款 | 30/70 T/T；FOB/EXW/DDP；样衣费抵扣规则 |
| 合规 | 非新疆棉溯源、标签服务（**落实之后再写**） |
| 回复时效、联系方式 | 1 个工作日；邮箱和 WhatsApp |

已经根据审核报告核实、可以直接用的有：2017 年成立、新塘地址、自有工序、amfori BSCI（TÜV 莱茵，2025-12）、排污登记有效期到 2030。

**全部确认后**，把 `<body class="draft">` 改成 `<body>`，标记和 Draft 标签就会全部消失。

**品牌名** "Hongjue Denim" 是按「宏爵」暂定的。如果要换，需要改 `index.html` 里的 `<title>`、页头、页脚、JSON-LD，以及 `tools/og.html`。

## 2. 照片

现在的网站全部用插画和纹理，没有照片也很完整。拍好工厂照片后（**不要用审核报告里的照片**），在 `index.html` 里找到 `PHOTO GALLERY` 注释，按里面的示例取消注释、换上照片就行。照片建议先转成 `.webp`，宽 1600px 左右。

## 3. 接收询盘

1. 去 [formspree.io](https://formspree.io) 注册（免费版每月 50 条），新建一个表单，拿到 ID。
2. 在 `index.html` 里把 `YOUR_FORM_ID` 替换成这个 ID。
3. 以后客户提交的询盘，包括他们选的版型和水洗，都会发到你们邮箱。

没配置之前，点 "Send inquiry" 会打开访客的邮件客户端，内容已经自动填好。

## 4. 上线

推荐用 **Cloudflare Pages** 或 **Netlify**：把整个 `website` 文件夹拖进去就能发布，再绑定自己的域名。用 GitHub Pages 也可以，但要求 public 仓库。

上线后：
- `index.html` 头部有一行被注释掉的 `canonical`，填上你们的域名后取消注释；同时把 `og:image` 改成完整网址，比如 `https://你的域名/assets/img/og-image.png`。这样在 WhatsApp、LinkedIn 等应用里分享链接时，能显示出预览大图。
- 在 [Google Search Console](https://search.google.com/search-console) 提交网站。
- 在 Google Ads 里把「表单提交」设为转化目标。

## 5. 修改图形（可选）

插画都是用代码生成的，在上一级的 `tools/` 文件夹里：

- `python3 tools/flats.py`：重新生成 6 个版型线稿和首屏款式图。版型参数在文件顶部的 `FITS`，可以调腰、臀、膝、脚口宽度。
- `node tools/render.js`：重新渲染水洗小样、背景纹理和社交分享图（需要 Playwright 和 Pillow）。

## 6. 本地预览

直接双击 `index.html` 就能看。也可以在 `website` 目录运行 `python3 -m http.server`，然后打开 http://localhost:8000 ，效果和线上完全一致。
