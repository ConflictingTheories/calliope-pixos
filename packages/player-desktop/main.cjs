const { app, BrowserWindow, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'PixoSpritz Player',
    icon: path.join(__dirname, 'icon.png'),
  });

  // Load the web player
  const playerPath = path.join(__dirname, '..', 'console', 'index.html');
  if (fs.existsSync(playerPath)) {
    mainWindow.loadFile(playerPath);
  } else {
    mainWindow.loadURL('https://pixospritz.com/player');
  }

  // Menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Game…',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [{ name: 'PixoSpritz Games', extensions: ['zip', 'spritz'] }],
            });
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send('load-game', result.filePaths[0]);
            }
          },
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'togglefullscreen' },
        { role: 'toggledevtools' },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

// Handle game file opened via OS (double-click .spritz file)
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  if (mainWindow) {
    mainWindow.webContents.send('load-game', filePath);
  }
});
