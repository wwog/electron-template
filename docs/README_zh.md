# Electron - React - Vite - Template

一个固执己见的项目模板。提供了更快速的打包，更方便的调试。

为了确保扩展性，使用脚本(scripts/cli.mjs)进行项目的驱动。可以根据自己需求追加定制功能。

## 模板使用

### 调试

1. `main process`代码 - 使用 vscode 下断点即可
2. `renderer process`代码,提供了更多调试手段
   - 使用 `devtools`,且本地加载`react-dev-tools`,如未出现请刷新控制台在重启。
   - 使用 `react-dev-inspector`,可通过元素定位源代码

### Electron-Builder 配置

请编辑 `electronbuilder.json` , 提供了更灵活的封装，并且可以在属性名前添加前缀，针对不同的环境进行不同的配置。


### 添加额外文件

参考以下[electronBuilder配置](./electronbuilder.json)中的extraFiles和extraResources用来添加资源到对应目录

例子：假设有一个dll文件需要在windows打包时附着根目录，将其放置于/extra/files/win32 即可。其余同理。


### NavtiveModule添加

参考[two package.json structure](https://www.electron.build/tutorials/two-package-structure)文档.

### 目录结构

- src/
  - assets/ 资源文件
  - common/ 可以放置所有进程都可访问的代码
  - config/ 雷同common通用配置，对于私密配置可以使用env，可参考vite文档
  - main/ 主进程代码
  - preload/ 预加载脚本
  - renderer/ 渲染进程代码

### 构建深入

#### 资源

`assets`存放资源文件，主进程的引入和渲染进程的引入目前是区分开的。因`electron`对于多倍图会自动导入，如果采用`vite`的导入图片并不会写入未引用的文件到构建目录,所以在`assets`中加入了`main`文件夹，这个文件夹会进行全量的复制移动,标准图和多倍图放置一起以供一些内置功能的使用。会有一点轻微冗余。不要将多余文件放置`assets/main`文件夹。

## TODO

1. 构建缩小代码的配置
2. 动态载入多语言。