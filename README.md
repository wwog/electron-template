## 1.add extra files

`extra` folder corresponding to the `electron-builder` files and `resources`. Copy files to the root directory and `resources` to `resources`

## 2.Debug

1. `main` - Break points are placed directly in the code in the main directory ，Use vscode directly f5
2. `renderer`
   - Use devTools
   - react-dev-inspector is used to locate source code
   - reactDevTools It is enabled by default at development time. If it does not appear, refresh the console

## 3.Electron Builder

### 1.Config

The project uses json as the configuration, which provides a more flexible packaging, and you can add DEV before the property name to make different configurations for different environments.

> configFile: `electronBuilder.json`

## 4.scripts

```
"dev": No main process and preload hot reload
"dev:restart": Main process and preload hot reload
"build": build Main,Renderer,preload to release/app/dist
"pack:dev": No installation package is generated, and the asar is unpacked
```

## 5.Project Technology stack

css: pandaCss

## 6.Coding

1. The preInit script located in the main process or the rendering process is used to perform some initialization operations. Do not execute code directly in the rest of the import script to avoid flow errors. For example, Preinit of the main process has a crash listener, which should be initialized as soon as possible, otherwise the previous problem will not be caught
