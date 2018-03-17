const fs = require('fs');
const path = require('path');
const request = require('request');
const config = require('../../config');
const NeteaseSong = require('../netease').Song;

function checkCover(album) {
    return new Promise(resolve => {
        if (album.cover.match(/^http/)) {
            let coverPath = path.resolve(config.coverPath, `${album.id}${path.extname(album.cover)}`);
            let coverWriter = fs.createWriteStream(coverPath);

            coverWriter.on('finish', async () => {
                album.cover = coverPath
                await album.save();
                resolve(album);
            })
            request(album.cover).pipe(coverWriter);
        } else {
            resolve(album);
        }
    })
}

function checkSong(song) {
    return new Promise(async resolve => {
        if (fs.existsSync(song.track)) {
            resolve(song);
        } else {
            let filePath = path.resolve(config.musicPath, `${song.title}-${song.artist.name}${path.extname(song.track)}`);
            let writer = fs.createWriteStream(filePath);

            writer.on('finish', async () => {
                song.track = filePath;
                await song.save();
                resolve(song);
            });
            let neteaseSong = new NeteaseSong(song.neteaseId);
            let track = await neteaseSong.getTrack();
            request(track).pipe(writer);
        }
    })
}
async function buildSongData(songs) {
    return songs.map(async song => {
        let album = song.album;
        album = await checkCover(album);
        song = await checkSong(song);

        return {
            id: song.id,
            cover: album.cover,
            name: song.title,
            lrc: song.lrc,
            artist: song.artist.name,
            track: song.track
        }

    })
}

module.exports = {
    buildSongData
}