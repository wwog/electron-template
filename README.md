[中文](./docs/README_zh.md)

# Electron - React - Vite - Template

A stubborn project template. It provides faster packaging and more convenient debugging.

To ensure extensibility, the project is driven by scripts (scripts/cli.mjs). You can add custom features according to your needs.

## Template Usage

### Debugging

1. `main process` code - You can set breakpoints in VS Code.
2. `renderer process` code, provides more debugging methods
   - Use `devtools`, and load `react-dev-tools` locally. If it does not appear, please refresh the console and restart.
   - Use `react-dev-inspector`, you can locate the source code through elements.

### Electron-Builder Configuration

Please edit `electronbuilder.json`, it provides more flexible packaging, and you can add a prefix to the property name to configure differently for different environments.

### Adding Extra Files

Refer to the extraFiles and extraResources in the [electronBuilder configuration](./electronbuilder.json) to add resources to the corresponding directory.

Example: Suppose there is a dll file that needs to be attached to the root directory when packaging windows // Just place it in /extra/files/win32. The same applies to others.

### Adding NativeModule

Refer to the [two package.json structure](https://www.electron.build/tutorials/two-package-structure) document.

### Directory Structure

- src/
  - assets/ Resource files
  - common/ Can place code that all processes can access
  - config/ Similar to common general configuration, for private configuration you can use env, refer to the vite document
  - main/ Main process code
  - preload/ Preload script
  - renderer/ Rendering process code

### Deep Build

#### Resources

`assets` stores resource files. The introduction of the main process and the rendering process are currently distinguished. Because `electron` will automatically import multiple images, if `vite` imports pictures, it will not write unquoted files to the build directory, so a `main` folder is added in `assets`. This folder will be copied and moved in full, and standard images and multiple images are placed together for some built-in functions. There will be a slight redundancy. Do not place extra files in the `assets/main` folder.

## TODO

1. Configuration for reducing code build
2. Dynamically load multiple languages.
