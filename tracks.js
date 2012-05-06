var tracks = (function() {
    var tracks = {};

    tracks.humanizeTime = function(time, withHours) {
        var h, m, s;
        h = Math.floor( time / 3600 );
        h = isNaN( h ) ? '--' : ( h >= 10 ) ? h : '0' + h;
        m = withHours ? Math.floor( time / 60 % 60 ) : Math.floor( time / 60 );
        m = isNaN( m ) ? '--' : ( m >= 10 ) ? m : '0' + m;
        s = Math.floor( time % 60 );
        s = isNaN( s ) ? '--' : ( s >= 10 ) ? s : '0' + s;
        return withHours ? h + ':' + m + ':' + s : m + ':' + s;
    };

    tracks.toAverage = function(value, total, decimal) {
        var r = Math.pow( 10, decimal || 0 );
        return Math.round( ( ( value * 100 ) / total ) * r ) / r;
    };

    tracks.fromAverage = function(average, total, decimal) {
        var r = Math.pow( 10, decimal || 0 );
        return  Math.round( ( ( total / 100 ) * average ) * r ) / r;
    };


    var Track = (function() {
        function Track(el) {
            this.el = el;
        }

        Track.prototype.attr = function(attr, val) {
            if (val) {
                this.el[attr] = val;
                return this;
            } else {
                return this.el[attr];
            }
        };

        Track.prototype.setVolume = function(volume) {
            this.volume = parseFloat(volume);
            this.el.volume = this.volume / 100;
            return this;
        };

        Track.prototype.play = function() {
            this.el.play();
            return this;
        };

        Track.prototype.pause = function() {
            this.el.pause();
            return this;
        };

        Track.prototype.on = function(handler, fn, bind) {
            var bind = bind ? bind : this;
            this.el.addEventListener(handler, function(e) {
                fn.apply(bind, [e]);
            });
        };

        return Track;
    })();

    tracks.Track = Track;


    var Tracks = (function() {
        var states = {
            HAVE_NOTHING: 0,
            HAVE_METADATA: 1,
            HAVE_CURRENT_DATA: 2,
            HAVE_FUTURE_DATA: 3,
            HAVE_ENOUGH_DATA: 4
        };

        var stateEvents = {
            loadedmetadata: states.HAVE_METADATA,
            loadeddata: states.HAVE_CURRENT_DATA,
            canplay: states.HAVE_FUTURE_DATA,
            canplaythrough: states.HAVE_ENOUGH_DATA
        };

        function Tracks(els) {
            this._el = document.createElement('div');
            this.longest = null;
            this.duration = null;
            this.currentTime = 0;
            this.tracks = new Array();
            this.each(els, function(el) {
                this.addTrack(new Track(el));
            });
            this._initEvents();
            return this;
        }

        Tracks.prototype._init = function() {
            this.longest = this.tracks[0];
            this.each(this.tracks, function(track) {
                if (this.longest.attr('duration') < track.attr('duration')) {
                    this.longest = track;
                }
            });
            this.duration = this.longest.attr('duration');
            this._initTimeEvents();
        };

        Tracks.prototype._initEvents = function() {
            this.on('loadedmetadata', function() {
                this._init();
            });
            this.on('timeupdate', function() {
                this.currentTime = this.longest.attr('currentTime');
            });
        };

        Tracks.prototype._initTimeEvents = function() {
            var events = ['timeupdate', 'ended', 'pause', 'play', 'playing'];
            this.each(events, function(type) {
                this.longest.on(type, function() {
                    this.trigger(type);
                }, this);
            });
        };

        Tracks.prototype.addTrack = function(track) {
            this._initTrackStateEvents(track);
            this.tracks.push(track);
            return this;
        };

        Tracks.prototype._initTrackStateEvents = function(track) {
            this.each(stateEvents, function(status, type) {
                var _this = this;
                this.applyAll(function() {
                    this.on(type, function() {
                        if (_this.getReadyState() >= status) {
                            _this.trigger(type);
                        }
                    });
                });
            });
        };

        Tracks.prototype.each = function(array, fn) {
            if (typeof(array.length) == 'undefined') {
                for (var attr in array) {
                    fn.apply(this, [array[attr], attr]);
                }
            } else {
                for (var i = 0, l = array.length; i < l; i++) {
                    fn.apply(this, [array[i], i]);
                }
            }
        };

        Tracks.prototype.getAverage = function(decimal) {
            return tracks.toAverage(this.currentTime, this.duration, decimal);
        };

        Tracks.prototype.getHumanizedTime = function(withHours) {
            return tracks.humanizeTime(this.currentTime, withHours);
        };

        Tracks.prototype.getHumanizedDuration = function(withHours) {
            return tracks.humanizeTime(this.duration, withHours);
        };

        Tracks.prototype.getReadyState = function() {
            var state = states.HAVE_ENOUGH_DATA;
            this.each(this.tracks, function(track) {
                state = (track.attr('readyState') < state) ? track.attr('readyState') : state;
            });
            return state;
        };

        Tracks.prototype.canPlay = function() {
            return (this.getReadyState() >= states.HAVE_FUTURE_DATA);
        };

        Tracks.prototype.play = function() {
            if (this.canPlay()) {
                this.setTime(this.currentTime);
                this.applyAll(function() {
                    this.play();
                });
                return this;
            } else {
                return false;
            }
        };

        Tracks.prototype.pause = function() {
            this.applyAll(function() {
                this.pause();
            });
            return this;
        };

        Tracks.prototype.setTime = function(time) {
            this.currentTime = time;
            this.applyAll(function() {
                this.time = time;
            });
        };

        Tracks.prototype.applyAll = function(fn, args) {
            this.each(this.tracks, function(track) {
                fn.apply(track, args);
            });
        };

        Tracks.prototype.on = function(type, fn) {
            var _this = this;
            this._el.addEventListener(type, function(e) {
                 fn.apply(_this, [e]);
            });
        };

        Tracks.prototype.trigger = function(type) {
            var e = document.createEvent('HTMLEvents');
            e.initEvent( type, false, true );
            this._el.dispatchEvent(e);
        };

        return Tracks;
    })();

    tracks.Tracks = Tracks;

    return tracks;
})();
