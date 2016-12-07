'use strict';
const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, shell, Menu, crashReporter } = require('electron');
const appMenu = require('./menu');

require('electron-debug')();
// crashReporter.start();

let mainWindow;

function updateBadge(title) {
  if (!app.dock) return;
  if (title.indexOf('WhatsApp Web') === -1) {
    return;
  }
  const messageCount = (/\(([0-9]+)\)/).exec(title);
  app.dock.setBadge(messageCount ? messageCount[1] : '');
}

function createMainWindow() {
  let win = new BrowserWindow({
    'title': app.getName(),
    'show': false,
    'width': 800,
    'height': 600,
    'min-width': 400,
    'min-height': 200,
    'title-bar-style': 'hidden-inset',
    'web-preferences': {
      // fails without this because of CommonJS script detection
      'node-integration': false,
      'preload': path.join(__dirname, 'browser.js'),
      // required for Facebook active ping thingy
      'web-security': false,
      'plugins': true
    }
  });

  win.loadURL('https://web.whatsapp.com/', {userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36"});
  win.on('closed', app.quit);
  win.on('page-title-updated', (e, title) => updateBadge(title));

  return win;
}

app.on('ready', () => {
  Menu.setApplicationMenu(appMenu);

  mainWindow = createMainWindow();

  const page = mainWindow.webContents;

  page.on('dom-ready', () => {
    page.insertCSS(fs.readFileSync(path.join(__dirname, 'browser.css'), 'utf8'));
    mainWindow.show();
  });

  page.on('new-window', (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  });
});
