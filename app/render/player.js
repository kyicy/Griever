const $ = require('jquery-slim');

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

    $("#player .icon.play").on("click", () => {
        this.song.play();
        this.timer.start(this.syncLrc.bind(this));
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

Player.prototype.play = function (songData) {
    this.song.pause();
    this.timer.stop();
    this.setSong(songData, (hasLrc) => {
        this.song.play();
        if (hasLrc) {
            this.timer.start(this.syncLrc.bind(this));
        }
    });

}


Player.prototype.setSong = function (songData, next) {
    this.song.lrc = null;
    this.song.setTrack(songData.track);
    this.song.canPlayThrough = false;
    // update cover 
    $("#player .cover").css("background-image", `url(${songData.cover})`);

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