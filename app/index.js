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

ipcMain.on('toggleSearchWindow', toggleSearchWindow);
ipcMain.on('togglePlaylistWindow', togglePlaylistWindow);
ipcMain.on('setTracks', (evt, tracks) => {
    let mainWindow = windows.get('mainWindow');
    mainWindow.webContents.send('setTracks', tracks);
})


ipcMain.on('playFromPlaylist', (evt, songId) => {
    let mainWindow = windows.get('mainWindow');
    mainWindow.webContents.send('playFromPlaylist', songId);
})

ipcMain.on('currentPlaying', (evt, songId) => {
    let playlistWindow = windows.get('playlistWindow');
    if (playlistWindow) {
        playlistWindow.webContents.send('currentPlaying', songId);
    }
})

ipcMain.on('addToPlaylist', (evt, songId) => {
    let mainWindow = windows.get('mainWindow');
    mainWindow.webContents.send('addToPlaylist', songId);
})

ipcMain.on('updatePlaylist', () => {
    let playlistWindow = windows.get('playlistWindow');
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
        mainWindow.setMenu(null);
        mainWindow.show();
        windows.set('mainWindow', mainWindow);

    });

    mainWindow.on('closed', () => {
        windows.delete('mainWindow')
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);

});

async function toggleSearchWindow() {
    if (windows.has('searchWindow')) {
        let searchWindow = windows.get('searchWindow');
        searchWindow.close();
    } else {
        let searchWindow = await createSearchWindow();
        searchWindow.show();
    }
}

function createSearchWindow() {
    return new Promise(resolve => {
        let pos = windows.get('mainWindow').getPosition();

        let searchWindow = new BrowserWindow({
            show: false,
            width: 400,
            x: pos[0] + 340,
            y: pos[1] - 25,
            resizable: false
        });

        searchWindow.once('ready-to-show', () => {
            searchWindow.setMenu(null);
            windows.set('searchWindow', searchWindow);
            resolve(searchWindow);
        });

        searchWindow.on('closed', () => {
            windows.delete('searchWindow');
        });

        searchWindow.loadURL(`file://${__dirname}/search.html`);
    })
}


async function togglePlaylistWindow() {
    if (windows.has('playlistWindow')) {
        let playlistWindow = windows.get('playlistWindow');
        playlistWindow.close();
    } else {
        let playlistWindow = await createPlaylistWindow();
        playlistWindow.show();
    }
}

function createPlaylistWindow() {
    return new Promise(resolve => {
        let pos = windows.get('mainWindow').getPosition();

        let playlistWindow = new BrowserWindow({
            show: false,
            width: 400,
            x: pos[0] + 340,
            y: pos[1] - 25,
            resizable: false
        });

        playlistWindow.once('ready-to-show', () => {
            playlistWindow.setMenu(null);
            windows.set('playlistWindow', playlistWindow);
            resolve(playlistWindow);
        });

        playlistWindow.on('closed', () => {
            windows.delete('playlistWindow');
        });

        playlistWindow.loadURL(`file://${__dirname}/playlist.html`);
    })
}