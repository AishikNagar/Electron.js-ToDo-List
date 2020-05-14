const electron = require('electron');
const url = require('url');
const path = require('path');

// SET ENV
// Comment this line to gain access to dev tools in app
process.env.NODE_ENV = 'production';

const { app, BrowserWindow, Menu, ipcMain } = electron;

// Creating a varible to represnt our main window
let mainWindow;
let addWindow;

// We will have 2 windows- one which will list all the items
// and one to add items

// Listen  for app to be ready
app.on('ready', function () {
  // Create new window
  mainWindow = new BrowserWindow({
    // Script tags in html files use vanilla js
    // In order to use node exclusive functionality such as <require>
    // We eed to toggle nodeIntegration on
    webPreferences: {
      nodeIntegration: true,
    },
  });
  // Load html file into the window
  mainWindow.loadURL(
    url.format({
      //   Passing the path for mainWindow.html
      pathname: path.join(__dirname, 'mainWindow.html'),
      protocol: 'file:',
      slashes: true,
    })
  );
  //   The above piece of code passes in- <file://dirname/mainWindow.html> to loadURL

  //   Quit app when closed
  mainWindow.on('closed', function () {
    app.quit();
  });
  //   Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Function to create addWindow
function createAddWindow() {
  // Create new window
  addWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
    width: 300,
    height: 200,
    title: 'Add Task',
  });

  // Load html file into the window
  addWindow.loadURL(
    url.format({
      //   Passing the path for mainWindow.html
      pathname: path.join(__dirname, 'addWindow.html'),
      protocol: 'file:',
      slashes: true,
    })
  );
  //   Handle garbage collection so addWindow isnt stored in memory after
  // closing. Optimizes memory usage of the app
  addWindow.on('closed', function () {
    addWindow = null;
  });
}

// Catch task:add

ipcMain.on('task:add', function (e, task) {
  console.log(task);
  // The function gets an event and a task on catching item:add
  // We will now send it to the main window
  mainWindow.webContents.send('task:add', task);
  addWindow.close();
});

// Create menu template
// A menu in electron is just an array of objects
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        click() {
          createAddWindow();
        },
      },
      {
        label: 'Delete all Tasks',
        click() {
          mainWindow.webContents.send('task:clear');
        },
      },
      {
        label: 'Quit',
        // Adding hotkey ctrl+q for quit
        // Using ternary operator to check cmd for mac or ctrl for win
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        // Adding a click event to this submenu
        click() {
          app.quit();
        },
      },
    ],
  },
];

// Fixing file menu issues for mac users
// if mac, add empty object to menu
if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({});
}

// Add dev tools item to menu if not in production
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle dev tools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        // We want the chrome dev tools to pop up on whichever window we are at
        // on the specific moment
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        //   Adding reload option
        role: 'reload',
        accelerator: process.platform == 'darwin' ? 'Command+R' : 'Ctrl+R',
      },
    ],
  });
}
