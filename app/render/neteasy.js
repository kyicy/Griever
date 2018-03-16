const request = require("request");
const _ = require("lodash");

function Song(neteasyId, name, artist, album) {
    this.neteasyId = neteasyId;
    this.name = name;
    this.artist = artist;
    this.album = album;
    this.track;
    this.lrc = false;

    this.getTrack = async function () {
        let url = encodeURI(`https://api.imjad.cn/cloudmusic/?type=song&id=${this.neteasyId}`);
        return new Promise((resolve, reject) => {
            request(url, (error, res, body) => {
                if (error) {
                    return reject(error);
                }
                let parsedBody = JSON.parse(body);
                this.track = parsedBody.data[0].url;
                resolve(this.track);
            })

        })
    }

    this.getLrc = async function () {
        let url = encodeURI(`https://music.163.com/api/song/media?id=${this.neteasyId}`);
        return new Promise((resolve, reject) => {
            request(url, (error, res, body) => {
                if (error) {
                    return reject(error);
                }
                let data = JSON.parse(body);
                if (data.lyric) {
                    this.lrc = data.lyric;
                }
                resolve(this.lrc);
            })
        })
    }

}

async function search(str) {
    let url = encodeURI(`https://api.imjad.cn/cloudmusic/?type=search&search_type=1&s=${str}`);
    return new Promise((resolve, reject) => {
        request(url, function (error, res, body) {
            if (error) {
                return reject(error)
            }

            let songs;
            try {
                songs = JSON.parse(body).result.songs;
            } catch (error) {
                return reject(error)
            }

            let firstFive = _.takeWhile(songs, (song, index) => {
                return index < 10
            })

            let results = firstFive.map(song =>
                new Song(song.id, song.name, song.ar[0], song.al)
            )

            resolve(results);

        })
    })
}

module.exports = {
    search,
    Song
}