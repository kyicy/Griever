const {
    ipcMain
} = require('electron');

const $ = require('jquery-slim');
const _ = require('lodash');

const {
    ipcRenderer
} = require('electron');


function Song() {
    this.audio = document.createElement('audio');
    this.audio.volume = 0.5;

    this.setTrack = function (src) {
        this.audio.src = src;;
    }

    this.play = function () {
        this.audio.play();
    }

    this.pause = function () {
        this.audio.pause()
    };

    this.toggleMute = function () {
        this.audio.muted = !this.audio.muted;
    };

    this.jumpTo = function (ratio) {
        var seekable = this.audio.seekable;
        var anchor = this.audio.duration * ratio;
        if (anchor > seekable.start(0) && anchor < seekable.end(0)) {
            this.audio.currentTime = anchor;
        }
    };

    this.setVolume = function (volume) {
        volume = parseFloat(volume);
        if (volume >= 0 && volume <= 1) {
            this.audio.volume = volume;
        }
    }
}


function Player() {
    this.timer = new Timer();
    this.song = new Song();
    this.tracks = [];
    this.mode = "repeat";
    this.currentPlaying = 0;
    this.setUpEventListener();
}

Player.prototype.setUpEventListener = function () {
    var that = this;

    $("#player .controls.icon, #player .cover").on("mousedown touchstart mousemove touchmove", function (e) {
        e.preventDefault();
    });

    this.song.audio.addEventListener("timeupdate", function () {
        var progress = this.currentTime / this.duration * 100;
        $("#player .progress").css("width", `${progress}%`);
    });

    this.song.audio.addEventListener("ended", () => {
        this.playNext();
    });

    this.song.audio.addEventListener("playing", () => {
        $("#player .icon.play").hide();
        $("#player .icon.pause").show();
    })

    this.song.audio.addEventListener("pause", () => {
        $("#player .icon.play").show();
        $("#player .icon.pause").hide();
    })

    $(this.song.audio).on("canplaythrough", () => {
        this.song.canPlayThrough = true;
    })

    $(this.song.audio).on("durationchange loadedmetadata loadeddata progress canplay canplaythrough", function () {
        if (this.readyState == 4) {
            var loaded = this.buffered.end(0)
            $("#player .buffer").css("width", `${loaded / this.duration * 100}%`)
        }
    })

    $("#player .icon.repeat").click(function () {
        that.mode = "repeat-one";
        $(this).hide();
        $("#player .icon.repeat-one").show();
    })

    $("#player .icon.repeat-one").click(function () {
        that.mode = "shuffle";
        $(this).hide();
        $("#player .icon.shuffle").show();
    })

    $("#player .icon.shuffle").click(function () {
        that.mode = "repeat";
        $(this).hide();
        $("#player .icon.repeat").show();
    })


    $("#player .icon.prev").on("click", () => {
        this.playPrev();
    });

    $("#player .icon.next").on("click", () => {
        this.playNext();
    });

    $("#player .icon.play").on("click", () => {
        if (this.tracks.length > 0) {
            this.song.play();
            this.timer.start(this.syncLrc.bind(this));
            ipcRenderer.send("currentPlaying", this.tracks[this.currentPlaying].id);
        }
    });

    $("#player .icon.pause").on("click", () => {
        this.timer.stop();
        this.song.pause();
    });

    $("#player .icon.volume").on("click", function () {
        $(this).hide();
        $("#player input.volume").show();
    })

    $("#player input.volume").on("mouseout", function () {
        $(this).hide();
        $("#player .icon.volume").show();
    }).on("input", function () {
        that.song.setVolume(parseInt(this.value) / 100);
    })

    $("#player .cover").on("click", function () {
        $("#player .lrc").toggle();
    });

    $("#player .line").on("click", function (e) {
        e.stopPropagation()
    });

    (function (that) {
        var progress_mousedown = false;
        $("#player .progressContainer").mousedown(function () {
            progress_mousedown = true;
        }).on("mousemove mouseup", function (e) {
            if (progress_mousedown && that.song.canPlayThrough) {
                var progress = e.offsetX / $(this).width();
                that.song.jumpTo(progress);
            }
        });
        $("body").mouseup(function () {
            progress_mousedown = false;
        });

    })(this);
}

Player.prototype.play = function (index) {
    this.currentPlaying = ((index >> 0) + this.tracks.length) % this.tracks.length;
    this.song.pause();
    this.timer.stop();
    this.setSong(this.tracks[this.currentPlaying], (hasLrc) => {
        this.song.play();
        ipcRenderer.send('currentPlaying', this.tracks[this.currentPlaying].id);
        if (hasLrc) {
            this.timer.start(this.syncLrc.bind(this));
        }
    });

}

Player.prototype.playBySongId = function (songId) {
    console.log(songId, this.tracks);
    let index = _.findIndex(this.tracks, track => track.id === songId);
    if (index !== -1) {
        this.play(index);
    }
}

Player.prototype.addTracks = function (songArray) {
    let preLength = this.tracks.length;
    let current;

    if (preLength > 0) {
        current = this.tracks[this.currentPlaying];
    }

    this.tracks = _.uniqBy(this.tracks.concat(songArray), track => track.id);
    if (preLength == 0 && this.tracks.length > 0) {
        this.setSong(this.tracks[0]);
    }

    if (preLength > 0) {
        let newIndex = _.findIndex(this.tracks, track => track.id == current.id);
        this.currentPlaying = newIndex;
    }
}

Player.prototype.setTracks = function (songArray) {
    let preLength = this.tracks.length;
    let prePlaying = this.currentPlaying;
    let current;

    if (preLength > 0) {
        current = this.tracks[prePlaying];
    }

    this.tracks = songArray;
    if (preLength == 0 && this.tracks.length > 0) {
        this.setSong(this.tracks[0]);
    }

    if (preLength > 0) {
        let newIndex = _.findIndex(this.tracks, track => track.id == current.id);
        if (newIndex == -1) {
            if (this.tracks.length > 0) {
                this.play(prePlaying);
            }
        } else {
            this.currentPlaying = newIndex;
        }
    }
    ipcRenderer.send('currentPlaying', this.tracks[this.currentPlaying].id);

}

function whichToPlay(current, mode, direction, total) {
    var index;
    if (mode == "repeat") {
        index = direction == "next" ? current + 1 : current - 1
    } else if (mode == "repeat-one") {
        index = current;
    } else {
        index = Math.round(Math.random() * total);
    }
    return index;
}


Player.prototype.playNext = function () {
    this.play(whichToPlay(this.currentPlaying, this.mode, "next", this.tracks.length));
}

Player.prototype.playPrev = function () {
    this.play(whichToPlay(this.currentPlaying, this.mode, "previous", this.tracks.length));
}

Player.prototype.setSong = function (songData, next) {
    this.song.lrc = null;
    this.song.setTrack(songData.track);
    this.song.canPlayThrough = false;
    // update cover 
    $("#player .cover").css("background-image", `url("${songData.cover}")`);

    // update detail
    $("#player .detail .title").text(`${songData.name} - ${songData.artist}`);

    // set default text for lyrics
    $("#player .lrc .line").text(songData.name);

    // get lyrics
    let hasLrc = !!songData.lrc;
    if (hasLrc) this.song.lrc = Lrc(songData.lrc);

    if (typeof next == 'function') {
        next(hasLrc);
    }
}

Player.prototype.syncLrc = function () {

    var lines = this.song.lrc;

    var anchor = Math.round(this.song.audio.currentTime * 10) * 100;

    while (true) {
        if (anchor < 0) {
            break;
        } else if (lines[anchor]) {
            $("#player .lrc .line").text(lines[anchor].text);
            break;
        } else {
            anchor -= 100;
        }
    }

}

function Timer() {
    this.interval;

    this.start = function (cb) {
        this.interval = setInterval(cb, 100);
    };

    this.stop = function () {
        clearInterval(this.interval);
    }
}

function Lrc(text) {
    var lines = text.split('\n');
    var result = {};
    lines.forEach(function (line) {
        var timeAnchors = line.match(/\d+:\d+\.\d+/g)
        if (!timeAnchors) {
            return
        }

        var _t = line.split("]");
        var text = _t[_t.length - 1];

        timeAnchors.forEach(function (anchor) {
            var _r = anchor.split(":").map(parseFloat)
            var time = (_r[0] * 60 + (Math.round(_r[1] * 10)) / 10) * 1000;
            result[time] = {
                text
            }
        })

    })
    return result;
}


module.exports = Player;