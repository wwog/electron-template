import { BrowserWindow, Menu, MenuItemConstructorOptions, Tray, app } from 'electron'
//import appLogo from '../assets/main/app_logo.png'

export class MenuBuilder {
  window: BrowserWindow
  tray: Tray

  constructor(window: BrowserWindow) {
    this.window = window
  //  this.tray = new Tray(appLogo)
  }

  buildMenu() {
    const template: MenuItemConstructorOptions[] = [
      {
        label: app.name,
        submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'quit' }],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'delete' },
          { role: 'selectAll' },
        ],
      },
      {
        label: 'Window',
        submenu: [{ role: 'minimize' }, { role: 'zoom' }, { role: 'close' }],
      },
    ]
    return Menu.buildFromTemplate(template)
  }

  /**
   * Apply menu to window,in macos,apply to application menu. in windows,apply to tray menu.
   */
  applyMenu() {
    if (process.platform === 'darwin') {
      const menu = this.buildMenu()
      Menu.setApplicationMenu(menu)
    } else if (process.platform === 'win32') {
      /*  */
    }
  }
}
