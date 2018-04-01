const electron = require('electron');
const {
    ipcRenderer
} = electron;

const models = require('./model');
const songHelper = require('./helper/song');


const $ = require('jquery-slim');

const playlistNode = $('#playlist');
const Player = require('./player');
const player = window.myPlayer = new Player();

const searchIcon = $('.icon.search');
const playlistIcon = $('.icon.playlist');

$('.operations > .icon').on('click', function () {
    let target = $(this).data('target');
    ipcRenderer.send('toggleWindow', target);
})

ipcRenderer.on('setTracks', (evt, tracks) => {
    player.setTracks(tracks)
})

ipcRenderer.on('playFromPlaylist', (evt, songId) => {
    player.playBySongId(songId);
})

async function findDefaultPlaylist() {
    let results = await models.Playlist.findOrCreate({
        where: {
            id: 1,
            name: 'default'
        }
    })
    let playlist = results[0];
    return playlist;
}

ipcRenderer.on('addToPlaylist', async (evt, songId) => {
    let playlist = await findDefaultPlaylist();
    await playlist.addSong(songId);
    let song = await models.Song.findById(songId);
    new Notification(song.title, {
        body: `added to playlist`
    })
    ipcRenderer.send('updatePlaylist');
})

async function initPlayer() {
    let playlist = await findDefaultPlaylist();
    let songs = await playlist.getSongs({
        include: [models.Album, models.Artist]
    });

    let data = await songHelper.buildSongData(songs);
    Promise.all(data).then(songData => {
        player.setTracks(songData);
    })
}

initPlayer();