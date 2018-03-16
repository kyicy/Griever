const fs = require('fs');
const path = require('path');
const electron = require('electron');
const $ = require('jquery-slim');
const neteasy = require('./neteasy');
const Player = require('./player');
const $neteasySearch = $('#neteasy-search');
const $neteasySearchResult = $('#neteasy-search-result');
const request = require('request');
const config = require('../config');
const Datauri = require('datauri').promise;

const player = new Player()

const models = require('./model');

let typingTimer;
var doneTypingInterval = 1000;

$neteasySearch.on("keyup", function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping.bind(this), doneTypingInterval);
})

$neteasySearch.on('keydown', () => clearTimeout(typingTimer));

let songs = [];

async function doneTyping() {
    try {
        songs = await neteasy.search(this.value);
        $neteasySearchResult.empty();
        songs.forEach(async song => {
            let element = $(`<li class="songListItem">
                <img src=${song.album.picUrl} class="cover"/>
                <span>${song.name} by ${song.artist.name}</span>
                <i class="icon play material-icons" data-neteasyid="${song.neteasyId}">play_circle_outline</i>            
            </li>`);
            $neteasySearchResult.append(element);
        })

    } catch (error) {
        console.log(error)
    }
}

$('#index ul').on('click', 'i.play', async function () {
    let neteasyId = parseInt($(this).data('neteasyid'));
    let song = songs.find(song => song.neteasyId === neteasyId);

    // check in database

    let _song = await models.Song.findOne({
        where: {
            neteasyId
        },
        include: [models.Artist, models.Album]
    })
    if (_song) {
        let songContent = await Datauri(_song.track);
        let coverContent = await Datauri(_song.album.cover);
        return player.play({
            cover: coverContent,
            name: _song.title,
            lrc: _song.lrc,
            artist: _song.artist.name,
            track: songContent
        })
    }

    let _artist = await models.Artist.findOne({
        where: {
            neteasyId: song.artist.id
        }
    })

    if (!_artist) {
        _artist = await models.Artist.create({
            neteasyId: song.artist.id,
            name: song.artist.name
        })
    }

    let _album = await models.Album.findOne({
        where: {
            neteasyId: song.album.id,
        }
    })

    if (!_album) {
        _album = await models.Album.create({
            neteasyId: song.album.id,
            cover: song.album.picUrl,
            title: song.album.name,
            artistId: _artist.id
        })
        let coverPath = path.resolve(config.coverPath, `${song.name}-${_artist.name}${path.extname(_album.cover)}`);
        let coverWriter = fs.createWriteStream(coverPath);

        coverWriter.on('finish', async () => {
            _album.cover = coverPath
            await _album.save();
        })

        request(_album.cover).pipe(coverWriter);

    }


    if (!_song) {
        _song = await models.Song.build({
            neteasyId: song.neteasyId,
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
            songContent = await Datauri(_song.track);
            songCover = await Datauri(_album.cover);
            player.play({
                cover: songCover,
                name: _song.title,
                lrc: _song.lrc,
                artist: _artist.name,
                track: songContent
            });

        })

        request(track).pipe(writer);


    }


    // save to database

})