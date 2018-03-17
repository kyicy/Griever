const fs = require('fs');
const path = require('path');
const electron = require('electron');
const $ = require('jquery-slim');
const LazyLoad = require('vanilla-lazyload');
const myLazyLoad = new LazyLoad();

const netease = require('./netease');
const $neteaseSearch = $('#netease-search');
const $neteaseSearchResult = $('#netease-search-result');
const config = require('../config');
const Datauri = require('datauri').promise;
const request = require('request');

const models = require('./model');
const {
    remote,
    ipcRenderer
} = electron;

let typingTimer;
var doneTypingInterval = 1000;

$neteaseSearch.on("keyup", function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping.bind(this), doneTypingInterval);
})

$neteaseSearch.on('keydown', () => clearTimeout(typingTimer));

let songs = [];

async function doneTyping() {
    try {
        songs = await netease.search(this.value);
        $neteaseSearchResult.empty();
        songs.forEach(async song => {
            let element = $(`<li class="songListItem">
                <img data-src=${song.album.picUrl} class="cover"/>
                <span>${song.name} by ${song.artist.name}</span>
                <i class="icon play material-icons" data-neteaseid="${song.neteaseId}">play_circle_outline</i>            
            </li>`);
            $neteaseSearchResult.append(element);
            myLazyLoad.update();
        })

    } catch (error) {
        console.log(error)
    }
}



$('#index ul').on('click', 'i.play', async function () {
    let neteaseId = parseInt($(this).data('neteaseid'));
    let song = songs.find(song => song.neteaseId === neteaseId);

    let _song = await models.Song.findOne({
        where: {
            neteaseId
        }
    })
    if (_song) {
        ipcRenderer.send('addToPlaylist', _song.id);
    }

    let _artist = await models.Artist.findOne({
        where: {
            neteaseId: song.artist.id
        }
    })

    if (!_artist) {
        _artist = await models.Artist.create({
            neteaseId: song.artist.id,
            name: song.artist.name
        })
    }

    let _album = await models.Album.findOne({
        where: {
            neteaseId: song.album.id,
        }
    })

    if (!_album) {
        _album = await models.Album.create({
            neteaseId: song.album.id,
            cover: song.album.picUrl,
            title: song.album.name,
            artistId: _artist.id
        })
        let coverPath = path.resolve(config.coverPath, `${_album.id}${path.extname(_album.cover)}`);
        let coverWriter = fs.createWriteStream(coverPath);

        coverWriter.on('finish', async () => {
            _album.cover = coverPath
            await _album.save();
        })

        request(_album.cover).pipe(coverWriter);

    }


    if (!_song) {
        _song = await models.Song.build({
            neteaseId: song.neteaseId,
            albumId: _album.id,
            artistId: _artist.id,
            title: song.name
        })
        _song.lrc = await song.getLrc();
        let track = await song.getTrack();
        if (!(track)) {
            return new Notification('play failed', {
                body: `${_song.title} can not be played`
            })
        }

        let filePath = path.resolve(config.musicPath, `${_song.title}-${_artist.name}${path.extname(track)}`)
        let writer = fs.createWriteStream(filePath);

        writer.on('finish', async () => {
            _song.track = filePath;
            await _song.save();
            ipcRenderer.send('addToPlaylist', _song.id);
        })

        request(track).pipe(writer);
        new Notification(_song.title, {
            body: `Start caching`
        })
    }

});