# malloc：一块内存的旅程

《嵌入式 Linux 系统》课程作业的独立函数讲解动画，覆盖背景、机制和用法。与项目中的交互创意案例分别展示。

升级版采用浅色、青绿和淡紫配色。封面与结尾使用生成的玻璃素材；核心图解用连续内存块、指针、请求路径和代码高亮解释分配过程。字幕与中文旁白保留原有时间线。

## 查看

- `../docs/media/malloc-explainer.mp4`：1920×1080、30 fps，约 2 分 36 秒，含中文旁白与烧录字幕。
- `../docs/media/malloc-zh.srt`：独立中文字幕。
- `../docs/media/poster.webp`：视频封面。
- `PRODUCTION.md`：制作方法、素材说明和查阅过的资料。
- `VALIDATION.md`：本次导出的检查记录。

## 编辑与导出

在本目录执行：

```sh
npm ci
npm run dev
npm run lint
npx remotion render src/index.ts MallocExplainer out/malloc.mp4 --codec=h264 --crf=18
```

预览由 Remotion Studio 提供；需要可用的浏览器与中文字体。此次使用 Microsoft YaHei，不附带系统字体。旁白已保存在 `public/voice/`，重新渲染不需要访问语音服务。

`src/MallocVideo.tsx` 编排场景、字幕和声音，`src/MemoryScenes.tsx` 实现主要原理图动画，`src/timeline.json` 记录实测时长和字幕边界。

## 解释范围

所有图形均为教学示意。连续空间指程序可访问的连续虚拟地址范围，不宣称物理内存连续。可用块的定位动画不代表 glibc 的具体搜索算法、缓存、arena 或元数据布局；内核扩展是另一种可能路径。预算条与时延波形不使用测量数据。

课程作者：何伟明 · 24电信4班。

## 片头与片尾配乐

最终发布版保留中文旁白和字幕，仅在开头约 12 秒与结尾约 14 秒加入轻配乐。机制、代码和错误示例部分不加背景音乐。

“Easy Lemon (60 second)” — Kevin MacLeod (incompetech.com)，CC BY 4.0。
来源：https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1200077
许可：https://creativecommons.org/licenses/by/4.0/
已截取、淡入淡出、调节音量并混音，详见 `public/music/ATTRIBUTION.md`。该音乐不受本项目其他源文件许可替代。

先按上述命令导出旁白母版，再执行后期脚本生成发布版（需要 FFmpeg 和可用的等宽字体）：

```sh
python scripts/add_music.py out/malloc.mp4 out/malloc-with-music.mp4 --ffmpeg ffmpeg --font /path/to/monospace.ttf
```
