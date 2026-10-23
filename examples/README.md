# 实际运行记录

这些记录于 2026.10.22 由本项目 C 源码在 Windows x64 上实际编译、执行后生成。

| 文件 | 内容 |
| --- | --- |
| windows-success.json | 正常 malloc、逐元素写入、读取和 free 的七个事件 |
| windows-injected-failure.json | 使用 --simulate-failure 主动返回 NULL 的单个失败事件 |
| native-checks.json | 退出码、事件数量、sizeof(int) 和网页模型一致性检查 |

编译器：TinyCC 0.9.27，x86_64 Windows。编译命令使用 `-Wall -Werror`；测试命令为 `node tests/native.test.cjs build/memory_journey.exe`。

本次对应的 `src/memory_journey.c` SHA-256：

```text
5d179cd26bb27c9aafc51df8cd006505d45df83257dc9f5b6c87346b66b23efc
```

编译器来自 [TinyCC 官方项目](https://bellard.org/tcc/)链接的 [GNU Savannah 发布包](https://download.savannah.gnu.org/releases/tinycc/tcc-0.9.27-win64-bin.zip)。下载的发布包大小为 489586 字节，本地记录的 SHA-256 为：

```text
34a721949a2583fdff725312da092fa0f5f1f284b702e6f811c6954714faabb2
```

后一个摘要是本地下载记录，不是来自独立渠道的签名验证。编译器及生成的可执行文件均未打包到源码项目中。

失败记录是主动注入，不是实测内存不足。运行环境是 Windows，不能由此推断 Linux/glibc 的分配器实现、地址布局或性能。网页仍是状态示意，不会在浏览器内调用原生 malloc。
