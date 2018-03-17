const models = require('./model');
const $ = require('jquery-slim');
const _ = require('lodash');
const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const Datauri = require('datauri').promise;

const songHelper = require('./helper/song');
const playlistNode = $('#playlist');

var playlist;

playlistNode.on('click', 'i.clear', async function () {
    let songId = $(this).data('id');
    console.log('click', songId);
    await playlist.removeSong(songId)
    buildList()
})

playlistNode.on('click', 'i.play_arrow', function () {
    let songId = $(this).data('id');
    ipcRenderer.send('playFromPlaylist', songId);
})


async function buildList() {
    let results = await models.Playlist.findOrCreate({
        where: {
            id: 1,
            name: 'default'
        }
    })
    playlist = results[0];

    let songs = await playlist.getSongs({
        include: [models.Album, models.Artist],
    });

    playlistNode.empty();

    let elements = songs.map(async (song) => {
        let coverContent = await Datauri(song.album.cover);
        let element = $(`<li data-id=${song.id}>
            <img src="${coverContent}"/>
            <span class="title">${song.title} by ${song.artist.name}</span>
            <div class="operations">
                <i class="icon clear material-icons" data-id=${song.id}>clear</i>
                <i class="icon play_arrow material-icons" data-id=${song.id}>play_arrow</i>
            </div>
        </li>`);
        return element
    })

    Promise.all(elements).then(async (nodes) => {
        playlistNode.append(nodes);
        let data = await songHelper.buildSongData(songs);
        Promise.all(data).then(songData => {
            ipcRenderer.send('setTracks', songData);
        })

    })
}

ipcRenderer.on('currentPlaying', async (evt, songId) => {
    $('li').removeClass('active');
    $(`li[data-id=${songId}]`).addClass('active');
})

ipcRenderer.on('updatePlaylist', async () => {
    buildList()
})

buildList();