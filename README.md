# 经济标 · 智能辅助评标（推荐质询单位）

静态演示页：质询建议、投标人卡片表格、分页与勾选联动。可分享给同事本地打开或部署静态页。

## 上传到 GitHub（分享给同事）

仓库地址：**https://github.com/wangzheng22/jingji**

**在线预览（推代码后约 1～2 分钟生效）：**  
https://wangzheng22.github.io/jingji/

> 若首次打开 404：到仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**，保存后再等一次部署完成。

同事也可克隆后本地预览：

```bash
git clone https://github.com/wangzheng22/jingji.git
cd jingji
python3 -m http.server 8080
```

浏览器打开 <http://localhost:8080> 即可预览（**默认打开登录页**）。

## 页面结构

| 文件 | 说明 |
|------|------|
| `index.html` | **登录页**（入口，提交后进入首页） |
| `home.html` | 智能辅助评标 / 推荐质询单位（原首页） |
| `styles.css` | 公共样式 |
| `app.js` | 首页数据与交互 |
| `assets/` | 图标与背景资源 |
