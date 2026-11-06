# 经济标 · 智能辅助评标（投标人评审汇总）

静态演示页：质询建议、投标人卡片表格、分页与勾选联动。可分享给同事本地打开或部署静态页。

## 上传到 GitHub（分享给同事）

1. 在 [GitHub 新建仓库](https://github.com/new)，名称建议 **`jingji-biao`**（描述可写「经济标演示页」），选 **Public** 便于同事 clone。
2. 在本目录执行（把 `你的用户名` 换成你的 GitHub 账号）：

```bash
cd "/Users/glodon/Documents/01广联达/01产品/18智能评标/经济标/经济标"
git remote add origin https://github.com/你的用户名/jingji-biao.git
git push -u origin main
```

3. 把仓库链接发给同事。同事克隆后：

```bash
git clone https://github.com/你的用户名/jingji-biao.git
cd jingji-biao
python3 -m http.server 8080
```

浏览器打开 <http://localhost:8080> 即可预览。

## 本地预览

```bash
cd 经济标
python3 -m http.server 8080
```

浏览器打开：<http://localhost:8080>

## 文件说明

| 文件 | 说明 |
|------|------|
| `index.html` | 页面结构 |
| `styles.css` | 样式 |
| `app.js` | 示例数据与交互 |
| `assets/` | 图标与背景资源 |
