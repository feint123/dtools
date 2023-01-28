# dtools
基于tauri实现的工具集合应用，支持插件安装

----

目前主应用和插件的通信方式更改为使用 [MessageChannel](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageChannel) 方案，不需要借助tauri api，因此不用再修改tauri的rust源代码。

剪切板、文件操作、sqlite等能力将通过 [dtools-api](https://github.com/feint123/dtools-api) 提供。

> 说明：项目中新增的前端代码，我会逐渐改为使用 typescript 进行编码。
