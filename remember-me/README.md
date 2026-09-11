# RG · Remember me

RAP GOING 2026 的童年照片小游戏。纯静态网页，可直接部署到 GitHub Pages。

## 当前内容
- 主游戏：15 人，每人只展示 1 张照片，随机且不重复
- 点击「揭晓」显示正确名字，由现场玩家自行判断对错
- 主游戏照片使用 `object-fit: contain`，完整显示，不裁切
- 进入主游戏前自动预加载全部主游戏图片，加载完成后再开始最顺畅
- 番外：17 张照片墙，不显示姓名，点击可放大查看
- iPad 横屏优先设计，同时保留手机/电脑自适应

## 部署
把整个 `remember-me` 文件夹放进 RG 仓库，然后用 GitHub Desktop Commit + Push。
若仓库开启 GitHub Pages，路径通常为：`你的站点地址/remember-me/`

## 文件结构
- `index.html` 页面结构
- `style.css` 样式
- `app.js` 交互、随机、预加载、照片墙
- `game-data.js` 主游戏及番外图片清单
- `assets/main/` 主游戏图片
- `assets/extra/` 番外图片
- `assets/rap-going-logo.svg` RAP GOING 标识
