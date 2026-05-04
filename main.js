const { app, BrowserWindow, ipcMain, Menu, screen } = require('electron');

let win;

app.whenReady().then(() => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: 128,
    height: 148,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');
  win.setPosition(width - 160, height - 180);
});

ipcMain.handle('get-window-position', () => win?.getPosition() ?? [0, 0]);

ipcMain.on('set-window-position', (_, { x, y }) => {
  win?.setPosition(Math.round(x), Math.round(y));
});

ipcMain.on('show-context-menu', (event) => {
  const menu = Menu.buildFromTemplate([
    { label: '关闭桌宠', click: () => app.quit() },
  ]);
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
});

app.on('window-all-closed', () => app.quit());
