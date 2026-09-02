# RAP GOING 2026 · 邀请函网页更新包

这是一个纯静态版本，不需要 npm、不需要数据库，也不需要服务器配置。GitHub Pages 可以直接运行。

## 文件结构

```text
index.html
styles.css
app.js
assets/
  logo.png
  invitations/
    18 张邀请函 PNG
```

## 最简单的使用方式

### 如果这是一个独立网页
把本文件夹里的全部内容放到 GitHub 仓库根目录并提交，开启 GitHub Pages 即可。

### 如果要放进现有 RAP GOING 网站
建议在仓库中建立一个 `invitation` 文件夹，把本更新包的全部内容放进去：

```text
你的仓库/
  invitation/
    index.html
    styles.css
    app.js
    assets/
```

之后邀请函页面地址就是现有网站地址后加 `/invitation/`。

## 已内置功能

- 首页 RAP GOING Logo + 2026 / 9.12 14:00 → 9.13 12:00 / 疯狂泳池派对
- 「获取邀请函」入口
- 18 人昵称及别名精确匹配
- 英文缩写忽略大小写
- 自动忽略昵称前后空格
- 空输入提示「请输入昵称哦 ✦」
- MATCHING 动画和成功问候
- 4 个固定彩蛋：羚羊 / 伍广 / 淤青 / 泽北
- 未匹配时不暴露名单
- 邀请函高清 PNG 原图展示
- 点击图片全屏查看
- 手机端可长按 / 截图保存
- 手机与电脑端自适应

## 修改昵称或彩蛋

打开 `app.js`，编辑顶部的 `PEOPLE` 数据即可。

## 注意

请保持 `assets/invitations/` 内的文件名不变，除非同时修改 `app.js` 中对应的 `file` 路径。
