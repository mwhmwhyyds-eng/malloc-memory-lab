# 内存旅程实验室

《嵌入式 Linux 系统》malloc 课程作业的主动补充案例。通过四个整数的生命周期，连接 C 代码与可交互的内存状态图。

案例与函数讲解视频是两个独立部分：案例用于操作与探索；video/ 中的动画工程独立讲解 malloc 的背景、机制与用法。视频使用生图素材、动态内存块、代码高亮、中文旁白与中文字幕。

## 体验内容

- 按步骤观察申请空间、逐元素初始化、读取第四个元素和释放对象。
- 跳转到任一主要阶段，代码与状态图同步高亮。
- 探索未初始化读取、访问 p[4] 和释放后访问。网页只解释错误，不执行有未定义行为的 C 代码。
- 运行真实 C 示例，载入它输出的 JSON 事件，回放对应过程。
- 模拟申请失败，观察返回 NULL 后停止使用的路径；失败情境由教学模型主动设定。

## 打开网页

直接打开 `docs/lab.html` 即可离线体验，没有外部字体、脚本或网络依赖。也可以在项目根目录运行：

```sh
python -m http.server 8000 --directory docs
```

然后打开 `http://localhost:8000/lab.html`。网页的下载入口对应 `docs/source/` 中的源码副本，与 `src/` 中的主源码保持一致。

## 运行 C 示例

Linux / GCC 或 Clang：

```sh
mkdir -p build
cc -std=c11 -Wall -Wextra -Wpedantic -Werror src/memory_journey.c -o build/memory_journey
./build/memory_journey > build/trace.json
./build/memory_journey --simulate-failure > build/failure.json
```

最后一条命令通过主动返回 NULL 演示失败分支，预期退出状态为非零，不代表机器真的内存不足。

Windows / Visual Studio x64 Native Tools Command Prompt：

```bat
mkdir build
cl /nologo /std:c11 /W4 /WX src\memory_journey.c /Fe:build\memory_journey.exe /Fo:build\memory_journey.obj
build\memory_journey.exe > build\trace.json
build\memory_journey.exe --simulate-failure > build\failure.json
```

Windows / 便携 TinyCC（本次实际使用的方式）：

```bat
tcc -Wall -Werror -o build\memory_journey.exe src\memory_journey.c
build\memory_journey.exe > build\trace.json
build\memory_journey.exe --simulate-failure > build\failure.json
```

先创建 `build` 目录。TinyCC 不包含在源码包中，可从[官方项目页面](https://bellard.org/tcc/)的 releases 入口获取。这里只将它用于本例的 Windows 编译和运行检查，不据此宣称完整 C11 一致性或 Linux/glibc 行为已验证。

网页底部展开“查看配套 C 程序与运行记录”，载入生成的 JSON。记录仅包含事件和 `sizeof(int)`，不提供实际地址、内存占用量或分配器内部信息。

## 检查

```sh
node tests/model.test.cjs
node tests/model.test.cjs build/trace.json build/failure.json
node tests/native.test.cjs build/memory_journey.exe
```

模型检查覆盖初始化边界、合法读取、越界、释放后访问、记录格式和 C 事件一致性。运行环境与本次检查结果单独记录，不能由上述命令的存在推断已在 Linux 或开发板上运行。

网页导入支持 UTF-8 BOM 与不同的 JSON 字段排列；损坏、超大、事件不匹配的文件会被拒绝并保留当前展示。重置、切换失败情境或选择更新的文件后，较早的异步读取结果不会覆盖新状态。

`examples/` 中提供本次 Windows C 程序实际生成的成功记录和主动注入失败记录，可以直接载入网页查看。记录来源、编译器与源码摘要见该目录的说明。

## 示意与实际运行的区别

网页是 JavaScript 教学模型，不调用宿主操作系统的 malloc。问号代表未初始化，灰色与叉号代表访问失效；都不是读取出来的内存内容。四个等宽方格代表四个 int 元素，不是四个字节。申请大小写作 `4 * sizeof *p`，不假设所有平台的 int 都是四字节。

C 源码正常分支实际调用 malloc 和 free，只读取已经初始化的元素。释放后不再求值或解引用旧指针。不通过执行越界、释放后访问或重复释放来展示错误。失败开关是显式注入的教学分支。

本案例不展示分配器内部结构，不代表 glibc 决策流程或实测内存布局。free 不等于清零，空间也不保证立即归还操作系统。

## 配套展示与项目文件

`src/` 放 C 源码，`docs/` 放可发布的交互页面，`tests/` 放模型检查，`video/` 放函数讲解动画工程、素材与声音。制作方法、提示词、参考来源和复现命令见 [video/PRODUCTION.md](video/PRODUCTION.md)。

- [展示首页](https://mwhmwhyyds-eng.github.io/malloc-memory-lab/)
- [观看原理视频](https://mwhmwhyyds-eng.github.io/malloc-memory-lab/watch.html)
- [打开交互案例](https://mwhmwhyyds-eng.github.io/malloc-memory-lab/lab.html)

`docs/media/` 保存最终 MP4、封面与字幕。在线展示需完成 GitHub Pages 部署；发布状态以实际访问结果为准。

## 技术依据

- [Linux man-pages: malloc(3)](https://man7.org/linux/man-pages/man3/malloc.3.html)：接口、未初始化内容、NULL 失败返回与释放约束。
- [GNU C Library 2.42: Freeing Memory Allocated with malloc](https://sourceware.org/glibc/manual/2.42/html_node/Freeing-after-Malloc.html)：释放、后续复用与归还操作系统的区别。

何伟明 · 24电信4班 · 2026.10.22
