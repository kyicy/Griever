const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron');

require('./config');

const migrate = require('./migrate');

migrate.cmdMigrate().then(results => {
    console.log(results);
})

let windows = new Map();

ipcMain.on('toggleWindow', (evt, target) => {
    toggleWindow(target);
});

ipcMain.on('setTracks', (evt, tracks) => {
    let mainWindow = windows.get('main');
    mainWindow.webContents.send('setTracks', tracks);
})


ipcMain.on('playFromPlaylist', (evt, songId) => {
    let mainWindow = windows.get('main');
    mainWindow.webContents.send('playFromPlaylist', songId);
})

ipcMain.on('currentPlaying', (evt, songId) => {
    let playlistWindow = windows.get('playlist');
    if (playlistWindow) {
        playlistWindow.webContents.send('currentPlaying', songId);
    }
})

ipcMain.on('addToPlaylist', (evt, songId) => {
    let mainWindow = windows.get('main');
    mainWindow.webContents.send('addToPlaylist', songId);
})

ipcMain.on('updatePlaylist', () => {
    let playlistWindow = windows.get('playlist');
    if (playlistWindow) {
        playlistWindow.webContents.send('updatePlaylist');
    }
})

app.on('ready', () => {
    let mainWindow = new BrowserWindow({
        width: 330,
        height: 480,
        show: false,
        resizable: false
    });

    mainWindow.once('ready-to-show', async () => {
        // mainWindow.setMenu(null);
        mainWindow.show();
        windows.set('main', mainWindow);

    });

    mainWindow.on('closed', () => {
        process.exit(0);
    });

    mainWindow.loadURL(`file://${__dirname}/views/index.html`);

});

async function toggleWindow(name) {
    if (windows.has(name)) {
        let window = windows.get(name);
        window.close();
    } else {
        let window = await createWindow(name);
        window.show();
    }
}

function createWindow(name) {
    return new Promise(resolve => {
        let pos = windows.get('main').getPosition();

        let window = new BrowserWindow({
            show: false,
            width: 400,
            x: pos[0] + 340,
            y: pos[1] - 25,
            resizable: false
        });

        window.once('ready-to-show', () => {
            // window.setMenu(null);
            windows.set(name, window);
            resolve(window);
        });

        window.on('closed', () => {
            windows.delete(name);
        });

        window.loadURL(`file://${__dirname}/views/${name}.html`);
    })
}