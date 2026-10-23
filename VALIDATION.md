# 验证记录 · 2026.10.22

## C 程序实际运行

本机原有 MSVC 缺少开发头文件，最初无法找到 stdio.h。本次改用项目工作目录中的便携 TinyCC 0.9.27（x86_64 Windows），未修改系统配置。

```text
tcc -Wall -Werror -o build/memory_journey.exe src/memory_journey.c
node tests/native.test.cjs build/memory_journey.exe
```

实际结果：编译成功，无警告；正常运行退出码 0，输出 7 个事件；主动注入失败退出码 1，输出一个 allocation_failed 事件；未知参数与多余参数均退出码 1，并向标准错误输出用法提示。JSON 可以解析，成功记录与网页模型逐步状态一致。该环境的 sizeof(int) 为 4。

本次未在 Linux、glibc 或开发板上运行，也未进行地址消毒器检查；Windows 运行通过不能代替这些环境的实测。TinyCC 检查也不等于完整 C11 标准一致性认证。

真实 C 输出保存在 examples/windows-success.json 与 examples/windows-injected-failure.json。工具来源、源码 SHA-256 和环境记录见该目录说明。

## 模型与导入检查

- 正常生命周期、逐元素初始化、合法读取、访问越界与释放后访问诊断。
- JSON 字段顺序独立；失败标记与事件一致性；错误事件、错误值和不安全的元数据范围拒绝。
- 非法事件顺序、越界写入事件和重复释放事件拒绝。
- C 实际输出与网页回放一致。

## 浏览器检查

使用本机 Google Chrome 检查主线七个事件、三种错误探索、返回原来的步骤、模拟申请失败、记录载入、损坏 JSON、超大文件、重置与源码下载。

另外复现并检查：UTF-8 BOM、乱序 JSON 字段、载入 C 真实记录后切换情境、读取文件期间重置、读取期间切换失败情境，以及较早读取比新读取更晚完成。较早结果均不会覆盖新状态。

检查桌面与 768、390、320 像素宽度排版，以及单文件离线交互版本。测试通过，未观察到页面脚本错误。

部分浏览器异常输入检查使用了合成测试夹具；这些夹具未作为 C 实测输出发布。当前未发布 GitHub 页面；函数讲解视频初版的独立检查记录见 video/VALIDATION.md。
