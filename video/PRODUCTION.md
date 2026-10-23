# malloc 函数讲解视频

本片独立介绍 malloc 的背景、机制与用法，与交互创意案例分开。画幅为 1920×1080，30 fps，时间线 4666 帧，约 2 分 36 秒。

## 已查阅的视频与声音资料

2026.10.22 查阅：Remotion 官方 [skills 仓库](https://github.com/remotion-dev/skills)约 5.5k 星，[skills.sh 的 remotion-best-practices 页面](https://skills.sh/remotion-dev/skills/remotion-best-practices)显示 661.9K 安装。比较了 inference-sh/skills（约 775 星）和 heygen-com/skills（约 510 星）。这些是查看时的数据，不代表统一的质量排名或独立使用人数。

本片采用 Remotion 官方技能中的帧驱动动画、分场景时间线、安全边距、媒体导入和按实测旁白时长编排的做法。参考版本为 remotion-dev/skills 提交 039e8a2fc78b67efc228d5645367838b85818a1c。没有执行远程技能中的任意安装脚本，也没有把它们安装为全局技能。

声音资料包括官方 Remotion voiceover 指南和 [rany2/edge-tts](https://github.com/rany2/edge-tts)，后者查看时约 12.4k 星。本片实际使用 edge-tts 合成 zh-CN-XiaoxiaoNeural 中文旁白，语速 -6%。按句边界生成字幕，按实际音频时长安排画面。逐场景通过 FFmpeg loudnorm 做音量处理，参数 I=-16、LRA=7、TP=-1.5；整片检查后统一降低 2.78 dB，升级版最终 MP4 实测综合响度 -16.00 LUFS，真实峰值 -4.24 dBTP。源码中的 Audio 音量保留了该整体调整。

## 文件与复现

- narration.json：九个场景的中文讲解稿。
- scripts/generate-voice.py：合成旁白、保留时间边界并输出 WAV 与字幕。
- src/timeline.json：实际音频时长、字幕时间与场景时长。
- src/MallocVideo.tsx 与 src/MemoryScenes.tsx：帧驱动场景、连续内存块、请求路径、代码高亮与字幕。
- public/images：内置 imagegen 生成的四个视觉素材。
- public/voice：逐场景旁白及原始时间边界。
- public/malloc-zh.srt：整片独立字幕。

安装 Node.js 与项目 package-lock.json 对应依赖后：

```sh
npm ci
npm run dev
npx tsc --noEmit
npx remotion render src/index.ts MallocExplainer out/malloc.mp4 --codec=h264 --crf=18
```

渲染环境需要可用的中文字体。本次 Windows 使用 Microsoft YaHei，不将系统字体文件复制到项目中。声音已预生成，重新渲染不需要重新访问 TTS 服务。

重新合成声音需要 Python 的 edge-tts、imageio-ffmpeg、mutagen：

```sh
python scripts/generate-voice.py
```

## 素材与生图提示

使用内置 imagegen，没有调用付费外部图生视频服务。原图保持不变。升级版保留 hero.png 用于开场、历史背景和结尾；核心机制采用代码绘制的清晰图形。Remotion 负责素材轻微平移与缩放、请求沿路径移动、可用块定位、连续内存中逐元素初始化及代码同步高亮。其他三张生成图保留在素材目录中，未用于升级版核心场景。没有使用生成模型去变形代码、字符或数据。

三张横图原始尺寸均为 1672×941，透明内存块为 1330×1182。横图在 1920×1080 画布上以不超过原始像素尺寸摆放；文字、数字、代码独立排版。1080p 指最终视频画幅，不表示素材是原生 4K。

四张图片的共同提示要求：科学教育用途、精致工业产品摄影质感、珍珠白与青绿光学玻璃、细微淡紫反光、清晰倒角、主体全部对焦；禁止文字、数字、水印、品牌、雾、辉光和景深模糊。下面保存每张最终使用的构图要求，便于复用：

1. hero.png：16:9，右侧恰好四个等宽厚矩形青绿光学玻璃块，轻微悬浮，背后有优雅透明玻璃丝带；左侧约 43% 留白，底部 18% 留给字幕。克制的近正面三分之四视角，背景为浅色无缝工作室。原始输出 exec-82258c45-665b-41c2-bf4d-14a8db718a06.png。
2. tile.png：参考 hero 的材质，生成恰好一个独立玻璃内存块，真正透明背景；大面积空白正面，轻微露出顶部和侧面，宽约高的 1.15 倍，四周透明留白。不要整排物体、丝带或地面。用于独立复制和运动。原始输出 exec-8a0d29a1-e2bf-45af-9bb8-94c48e7eadea.png。
3. context.png：参考 hero 的材质与配色。右侧为抽象嵌入式计算板，一个不带字的深青色处理器，四个透明内存模块、少量银色走线和金色触点；若干长短不一的空白玻璃数据块沿路径接近。左侧 45% 和底部 18% 留白。它是数据长度变化的教学隐喻，不是具体硬件实测图。原始输出 exec-0a8715eb-26c3-4c22-94a4-ef8f4027326b.png。
4. layers.png：参考 hero 材质。右侧恰好三层悬浮薄玻璃平台，上层淡紫、中层青绿、下层略深青；只有中层放置少量玻璃块。平台之间保留间距，左侧 45% 和底部 18% 留白，不画箭头与标签，后期单独标注应用、C 库分配器和内核。原始输出 exec-18971681-e312-45bf-8dc6-ff2c1b945a35.png。

## 技术事实来源

- [Linux man-pages malloc(3)](https://man7.org/linux/man-pages/man3/malloc.3.html)：函数原型、字节参数、未初始化内容、失败返回、相关接口和标准记录。
- [GNU C Library 2.42 — The GNU Allocator](https://sourceware.org/glibc/manual/2.42/html_node/The-GNU-Allocator.html)：glibc、ptmalloc、dlmalloc 的关系，以及复用与映射策略。
- [GNU C Library 2.42 — Freeing after Malloc](https://sourceware.org/glibc/manual/2.42/html_node/Freeing-after-Malloc.html)：释放、复用与归还操作系统。

所有玻璃块、层次和颜色变化均为概念示意，不代表实际地址、glibc 字段布局或运行性能。C89 是本片提到的标准化节点，不宣称 malloc 最早诞生于 C89。嵌入式内存预算与时延部分是设计建议，不是本项目的性能测量。

## 2026.10.23 原理动画升级

- 保留标题、浅色配色、生成图封面和结尾；核心场景改为进程虚拟内存中的分配过程。
- 背景用固定容量与当前输入长度的变化解释动态分配需求。
- 一次申请以同一个整体边框表示，内部划分四个 int 元素；标注指针起点、下标和 `4 × sizeof(int)` 字节，不假定 int 必为四字节。
- 分配器动画说明一种复用路径；定位框不代表实际 glibc 的线性搜索或特定分配算法。扩展内核路径另作条件说明，不表示每次调用都要扩展。
- free 后断开原对象访问连接，以生命周期结束和可供复用说明状态，不以清零、碎裂或销毁表示释放。
- 安全部分分别示意越界、丢失最后一个可用指针、相关接口、预算和关键路径时延。预算条和波形是概念图，未使用性能测量数据。
- 中文讲解稿、原始声音与字幕时间不变；九段导出声音均与源 WAV 做波形对齐检查。保留初版 MP4 供比较。
- 最终检查时将一条扩展路径注释移开箭头；局部重新渲染后按帧替换，并再次对整片解码与检查。项目源码已包含该位置修正。
