var tracks = function () {
    "use strict";
};


/**
 * Returns value from average.
 *
 * @param float average The average
 * @param float total The max value
 * @param integer precision The precision
 * @return float The value
 */
tracks.fromAverage = function (average, total, precision) {
    "use strict";
    var r = Math.pow(10, precision || 0);
    return Math.round(((total / 100) * average) * r) / r;
};


/**
 * Returns time as a human readable string.
 *
 * @param integer time The time to convert
 * @param boolean withHours Should add hours to output
 * @return string The time string
 */
tracks.humanizeTime = function (time, withHours) {
    "use strict";
    var h, m, s;
    h = Math.floor(time / 3600);
    h = isNaN(h) ? '--' : (h >= 10) ? h : '0' + h;
    m = withHours ? Math.floor(time / 60 % 60) : Math.floor(time / 60);
    m = isNaN(m) ? '--' : (m >= 10) ? m : '0' + m;
    s = Math.floor(time % 60);
    s = isNaN(s) ? '--' : (s >= 10) ? s : '0' + s;
    return withHours ? h + ':' + m + ':' + s : m + ':' + s;
};


/**
 * Returns an average.
 *
 * @param float value The value
 * @param float total The max value
 * @param integer precision The precision
 * @return integer The average
 */
tracks.toAverage = function (value, total, precision) {
    "use strict";
    var r = Math.pow(10, precision || 0);
    return Math.round(((value * 100) / total) * r) / r;
};


/**
 * Represents a media (audio / video) track.
 *
 * @param HTMLElement el The HTML media element
 * @param Boolean preload A optional boolean to force preload
 */
var Track = function (el, preload) {
    "use strict";
    preload = preload || true;
    this.el = el;
    if (preload) {
        this.preload();
    }
    return this;
};


/**
 * Gets or sets the value for given attribute name.
 *
 * @param string attr The attribute name
 * @param string value The value
 */
Track.prototype.attr = function (attr, val) {
    "use strict";
    if (arguments.length === 2) {
        this.el[attr] = val;
        return this;
    }
    return this.el[attr];
};


/**
 * Gets the position as average.
 *
 * @param integer decimal The decimal
 * @return float
 */
Track.prototype.getAverage = function (decimal) {
    "use strict";
    return tracks.toAverage(this.attr('currentTime'), this.attr('duration'), decimal);
};


/**
 * Returns duration as a human readable string.
 *
 * @return string
 */
Track.prototype.getHumanizedDuration = function (withHours) {
    "use strict";
    return tracks.humanizeTime(this.attr('duration'), withHours);
};


/**
 * Returns the buffered time ranges as a bidimensional array
 *
 * @return Array
 */
Track.prototype.getBufferedRanges = function () {
    "use strict";
    var timeRanges = this.attr('buffered'),
        buffered = [],
        i;
    for (i = 0; i < timeRanges.length; i++) {
        buffered.push([timeRanges.start(i), timeRanges.end(i)]);
    }
    return buffered;
};


/**
 * Returns time as a human readable string.
 *
 * @return string
 */
Track.prototype.getHumanizedTime = function (withHours) {
    "use strict";
    return tracks.humanizeTime(this.attr('currentTime'), withHours);
};


/**
 * Stops playing the media.
 *
 * @return Track
 */
Track.prototype.pause = function () {
    "use strict";
    this.el.pause();
    return this;
};


/**
 * Starts playing the media.
 *
 * @return Track
 */
Track.prototype.play = function () {
    "use strict";
    this.el.play();
    return this;
};


/**
 * Preloads the sound.
 *
 * @return Track The current object
 */
Track.prototype.preload = function () {
    "use strict";
    this.attr('preload', 'auto');
    return this;
};


/**
 * Adds listener for given event.
 *
 * @param string handler The event type
 * @param callable fn The callback
 * @param object bind The object to bind
 */
Track.prototype.on = function (handler, fn, bind) {
    "use strict";
    var bind = bind || this;
    this.el.addEventListener(handler, function (e) {
        fn.apply(bind, [e]);
    });
    return this;
};


/**
 * Jumps to given time.
 *
 * @param float time The new time in second.
 * @return Track The current object
 */
Track.prototype.seek = function (time) {
    "use strict";
    this.attr('currentTime', time);
    return this;
};


/**
 * Sets the volume.
 *
 * @param integer volume The volume (0 - 100)
 * @return Track
 */
Track.prototype.setVolume = function (volume) {
    "use strict";
    this.volume = parseFloat(volume);
    this.el.volume = this.volume / 100;
    return this;
};


/**
 * Stops playing the media.
 *
 * @return Track
 */
Track.prototype.stop = function () {
    "use strict";
    this.el.pause();
    this.seek(0);
    return this;
};


tracks.Track = Track;


/**
 * Represents a media group.
 *
 * @param Array els An array of HTML media elements
 * @param Boolean preload A optional boolean to force preload
 */
var Tracks = function (els, preload) {
    "use strict";
    var states = {
        HAVE_NOTHING: 0,
        HAVE_METADATA: 1,
        HAVE_CURRENT_DATA: 2,
        HAVE_FUTURE_DATA: 3,
        HAVE_ENOUGH_DATA: 4
    };

    this.stateEvents = {
        loadedmetadata: states.HAVE_METADATA,
        loadeddata: states.HAVE_CURRENT_DATA,
        canplay: states.HAVE_FUTURE_DATA,
        canplaythrough: states.HAVE_ENOUGH_DATA
    };

    this.states = states;

    this._el = document.createElement('div');
    this.longest = null;
    this.duration = null;
    this.currentTime = 0;
    this.tracks = [];
    this.each(els, function (el) {
        this.addTrack(new Track(el, false));
    });
    this._initEvents();
    preload = preload || true;
    if (preload) {
        this.preload();
    }
    return this;
};


/**
 * Adds a Track.
 *
 * @param Track track The track
 */
Tracks.prototype.addTrack = function (track) {
    "use strict";
    this._initTrackStateEvents(track);
    this.tracks.push(track);
    return this;
};


/**
 * Applies a callble to all tracks.
 *
 * @param callable fn The callbale to apply
 * @param args Array The arguments
 * @return tracks
 */
Tracks.prototype.applyAll = function (fn, args) {
    "use strict";
    this.each(this.tracks, function (track) {
        fn.apply(track, args);
    });
    return this;
};


/**
 * Cheks if tracks can be played.
 *
 * @return boolean
 */
Tracks.prototype.canPlay = function () {
    "use strict";
    return (this.getReadyState() >= this.states.HAVE_FUTURE_DATA);
};


/**
 * Iterates over objects and arrays.
 *
 * @param object/Array array The object to iterate on
 * @param callable fn The iteration
 */
Tracks.prototype.each = function (array, fn) {
    "use strict";
    var attr, i, l;
    if (typeof (array.length) === 'undefined') {
        for (attr in array) {
            fn.apply(this, [array[attr], attr]);
        }
    } else {
        for (i = 0, l = array.length; i < l; i++) {
            fn.apply(this, [array[i], i]);
        }
    }
    return this;
};


/**
 * Gets the position as average.
 *
 * @param integer decimal The decimal
 * @return float
 */
Tracks.prototype.getAverage = function (decimal) {
    "use strict";
    return tracks.toAverage(this.currentTime, this.duration, decimal);
};


/**
 * Returns buffered time ranges as a bidimensional array.
 *
 * @return Array
 */
Tracks.prototype.getBufferedRanges = function () {
    "use strict";
    var ranges = [[0, this.duration]];
    if (this.tracks.length > 0) {
        this.each(this.tracks, function (track) {
            var trackRanges =  track.getBufferedRanges();
            if (track.attr('duration') !== this.duration) {
                trackRanges.push([track.attr('duration'), this.duration]);
            }
            ranges = this._intersectRanges(ranges, trackRanges);
        });
    }
    return ranges;
};


/**
 * Returns duration as a human readable string.
 *
 * @return string
 */
Tracks.prototype.getHumanizedDuration = function (withHours) {
    "use strict";
    return tracks.humanizeTime(this.duration, withHours);
};


/**
 * Returns time as a human readable string.
 *
 * @return string
 */
Tracks.prototype.getHumanizedTime = function (withHours) {
    "use strict";
    return tracks.humanizeTime(this.currentTime, withHours);
};


/**
 * Gets the ready state.
 *
 * @return integer
 */
Tracks.prototype.getReadyState = function () {
    "use strict";
    var state = this.states.HAVE_ENOUGH_DATA;
    this.each(this.tracks, function (track) {
        state = (track.attr('readyState') < state) ? track.attr('readyState') : state;
    });
    return state;
};


/**
 * Adds a listener for given event.
 *
 * @param string type The event type
 * @param callable fn The Callable
 */
Tracks.prototype.on = function (type, fn) {
    "use strict";
    var _this = this;
    this._el.addEventListener(type, function (e) {
         fn.apply(_this, [e]);
    });
    return this;
};


/**
 * Stops playing the tracks.
 *
 * @return tracks
 */
Tracks.prototype.pause = function () {
    "use strict";
    this.applyAll(function () {
        this.pause();
    });
    return this;
};


/**
 * Starts playing the tracks.
 *
 * @return Tracks
 */
Tracks.prototype.play = function () {
    "use strict";
    if (this.canPlay()) {
        this.seek(this.currentTime);
        this.applyAll(function () {
            this.play();
        });
        return this;
    } else {
        return false;
    }
};


/**
 * Preloads all tracks.
 *
 * @return Track The current object
 */
Tracks.prototype.preload = function () {
    "use strict";
    this.applyAll(function () {
        this.preload();
    });
    return this;
};


/**
 * Jumps to given time.
 *
 * @param float time The new time in second.
 * @return Tracks
 */
Tracks.prototype.seek = function (time) {
    "use strict";
    this.currentTime = time;
    this.applyAll(function () {
        this.seek(time);
    });
    return this;
};


/**
 * Stops playing the tracks.
 *
 * @return Tracks
 */
Tracks.prototype.stop = function () {
    "use strict";
    if (this.canPlay()) {
        this.applyAll(function () {
            this.stop();
        });
        return this;
    } else {
        return false;
    }
};


/**
 * Triggers an event.
 *
 * @param string type The event type
 */
Tracks.prototype.trigger = function (type) {
    "use strict";
    var e = document.createEvent('HTMLEvents');
    e.initEvent(type, false, true);
    this._el.dispatchEvent(e);
    return this;
};


/**
 * Sets the longest track and duration when metadatas have been loaded.
 */
Tracks.prototype._init = function () {
    "use strict";
    this.longest = this.tracks[0];
    this.each(this.tracks, function (track) {
        if (this.longest.attr('duration') < track.attr('duration')) {
            this.longest = track;
        }
    });
    this.duration = this.longest.attr('duration');
    this._initTimeEvents();
};


/**
 * Initializes main event listeners.
 */
Tracks.prototype._initEvents = function () {
    "use strict";
    this.on('loadedmetadata', function () {
        this._init();
    });
    this.on('timeupdate', function () {
        this.currentTime = this.longest.attr('currentTime');
    });
};


/**
 * Initializes time related events.
 */
Tracks.prototype._initTimeEvents = function () {
    "use strict";
    var events = ['timeupdate', 'ended', 'pause', 'play', 'playing'];
    this.each(events, function (type) {
        this.longest.on(type, function () {
            this.trigger(type);
        }, this);
    });
};


/**
 * Initializes the state change events.
 */
Tracks.prototype._initTrackStateEvents = function (track) {
    "use strict";
    this.each(this.stateEvents, function (status, type) {
        var _this = this;
        track.on(type, function () {
            if (_this.getReadyState() >= status) {
                _this.trigger(type);
            }
        });
    });
};


/**
 * Returns the intersections beetween two bidimensional range arrays.
 *
 * Assumed that ranges in arrays doesn't intersect themselves.
 *
 * @return Array
 */
Tracks.prototype._intersectRanges = function (a, b, max) {
    "use strict";
    var ranges = [];
    this.each(a, function (aRange) {
        this.each(b, function (bRange) {
            if (!(bRange[0] > aRange[1] || bRange[1] < aRange[0])) {
                var start = aRange[0] > bRange[0] ? aRange[0] : bRange[0];
                var end = aRange[1] < bRange[1] ? aRange[1] : bRange[1];
                ranges.push([start, end]);
            }
        });
    });
    return ranges;
};


tracks.Tracks = Tracks;
