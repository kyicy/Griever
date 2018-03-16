const {
    app,
    BrowserWindow
} = require('electron');

require('./config');

const migrate = require('./migrate');

migrate.cmdMigrate().then(results => {
    console.log(results);

})

let mainWindow = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 700,
        height: 550,
        show: false,
        resizable: false
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.setMenu(null);
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`)
});