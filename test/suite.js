mocha.setup('tdd');


var helpers = (function () {
    "use strict";
    var helpers = {};

    helpers.source = function (src, type) {
        var source = document.createElement('source');
        source.setAttribute('src', src);
        source.setAttribute('type', type);
        return source;
    };

    helpers.audio = function (sources) {
        var el = document.createElement('audio');
        el.setAttribute('preload', 'none');
        if (sources) {
            for (var i = 0, l = sources.length; i < l; i++) {
                el.appendChild(sources[i]);
            }
        }
        return el;
    };

    return helpers;
})();


suite('tracks', function () {
    suite('#fromAverage()', function () {
        test('should return the right integer position', function () {
            expect(tracks.fromAverage(80, 100)).to.be(80);
            expect(tracks.fromAverage(80, 1000)).to.be(800);
        });
        test('should return a rounded integer position', function () {
            expect(tracks.fromAverage(4, 847)).to.be(34);
        });
        test('should return a rounded float position when `precision` arg is provided', function () {
            expect(tracks.fromAverage(4, 847, 1)).to.be(33.9);
            expect(tracks.fromAverage(4, 847, 2)).to.be(33.88);
        });
    });

    suite('#humanizeTime()', function () {
        test('should return a 4 digit fomated string', function () {
            expect(tracks.humanizeTime(184)).to.be("03:04");
        });
        test('should return a 6 digit fomated string when withHours optional argument is set to true', function () {
            expect(tracks.humanizeTime(18445, true)).to.be("05:07:25");
        });
    });

    suite('#toAverage()', function () {
        test('should return a rounded average', function () {
            expect(tracks.toAverage(80, 100)).to.be(80);
            expect(tracks.toAverage(801, 1000)).to.be(80);
            expect(tracks.toAverage(12, 1100)).to.be(1);
        });
        test('should return a rounded decimal average for given values when `precision` arg is provided', function () {
            expect(tracks.toAverage(801, 1000, 2)).to.be(80.10);
            expect(tracks.toAverage(12, 1100, 8)).to.be(1.09090909);
        });
    });

    suite('Track', function () {
        var el, t;

        setup(function () {
            el = helpers.audio([
                helpers.source('sounds/craw.ogg', 'audio/ogg'),
                helpers.source('sounds/craw.mp3', 'audio/mp3')
            ]);
            t = new tracks.Track(el);
        });

        suite('#attr()', function () {
            test('should set `el` attibute with given value', function () {
                t.attr('rel', 'test');
                expect(el.rel).to.be('test');
            });
            test('should get `el` attibute', function () {
                t.attr('rel', 'test');
                expect(t.attr('rel')).to.be('test');
            });
        });

        suite('#getAverage()', function () {
            test('should return the correct integer average', function (done) {
                t.on('canplaythrough', function () {
                    t.seek(1.2);
                    expect(t.getAverage()).to.equal(40);
                    done();
                });
            });
            test('should return the correct decimal average', function (done) {
                t.on('canplaythrough', function () {
                    t.seek(1.2);
                    expect(t.getAverage(2)).to.equal(40.02);
                    done();
                });
            });
        });

        suite('#getHumanizedDuration', function () {
            test('should return the correct human readable duration', function (done) {
                t.on('loadedmetadata', function () {
                    expect(t.getHumanizedDuration()).to.equal('00:02')
                    done();
                });
            });
            test('should return the correct human readable duration with hours', function (done) {
                t.on('loadedmetadata', function () {
                    expect(t.getHumanizedDuration(true)).to.equal('00:00:02')
                    done();
                });
            });
        });

        suite('#getHumanizedTime', function () {
            test('should return the correct human readable time', function (done) {
                t.on('canplaythrough', function () {
                    t.seek(1);
                    expect(t.getHumanizedTime()).to.equal('00:01')
                    done();
                });
            });
            test('should return the correct human readable time with hours', function (done) {
                t.on('loadedmetadata', function () {
                    t.seek(1);
                    expect(t.getHumanizedTime(true)).to.equal('00:00:01')
                    done();
                });
            });
        });

        suite('#play()', function () {
            test('should be playable when ready', function (done) {
                t.on('canplay', function () {
                    t.play();
                });
                t.on('play', function () {
                    t.pause();
                    done();
                });
            });
        });

        suite('#on()', function () {
            test('should register the given function as a listener for given event type', function (done) {
                t.on('theevent', function () {
                    done();
                });
                var e = document.createEvent('HTMLEvents');
                e.initEvent('theevent', false, true );
                el.dispatchEvent(e);
            });
            test('loadedmetadata should be fired up', function (done) {
                t.on('loadedmetadata', function () {
                    done();
                });
            });
            test('loadeddata should be fired up', function (done) {
                t.on('loadeddata', function () {
                    done();
                });
            });
            test('canplay should be fired up', function (done) {
                t.on('canplay', function () {
                    done();
                });
            });
            test('canplaythrough should be fired up', function (done) {
                t.on('canplaythrough', function () {
                    done();
                });
            });
        });

        suite('#seek()', function () {
            test('should jump to right time for given integer', function (done) {
                t.on('canplaythrough', function () {
                    t.seek(2);
                    expect(t.attr('currentTime')).to.be(2);
                    done();
                });
            });
            test('should jump to right time for given float', function (done) {
                t.on('canplaythrough', function () {
                    t.seek(1.0234);
                    expect(Math.round(t.attr('currentTime') * 10000) / 10000).to.equal(1.0234);
                    done();
                });
            });
        });

        teardown(function () {
            delete el, t;
        });
    });

    suite('Tracks', function () {
        var els, t, seagull, craw;

        setup(function (done) {
            seagull = helpers.audio([
                helpers.source('sounds/seagull.ogg', 'audio/ogg'),
                helpers.source('sounds/seagull.mp3', 'audio/mp3')
            ]);
            craw = helpers.audio([
                helpers.source('sounds/craw.ogg', 'audio/ogg'),
                helpers.source('sounds/craw.mp3', 'audio/mp3')
            ]),
            els = [seagull, craw];
            t = new tracks.Tracks(els);
            done();
        });

        suite('#on()', function () {
            test('loadedmetadata should be fired up', function (done) {
                t.on('loadedmetadata', function () {
                    done();
                });
            });
            test('loadeddata should be fired up', function (done) {
                t.on('loadeddata', function () {
                    done();
                });
            });
            test('canplay should be fired up', function (done) {
                t.on('canplay', function () {
                    done();
                });
            });
            test('canplaythrough should be fired up', function (done) {
                t.on('canplaythrough', function () {
                    done();
                });
            });
        });

        suite('#longest', function () {
            test('should be sets when loadedmetadata', function (done) {
                expect(t.longest).to.be(null);
                t.on('loadedmetadata', function () {
                    expect(t.longest).not.to.be(null);
                    done();
                });
            });
            test('should be the longest track', function (done) {
                t.on('loadedmetadata', function () {
                    expect(t.longest.el).to.be(seagull)
                    done();
                });
            });
        });

        suite('#seek()', function () {
            test('should jump to right time for given integer', function (done) {
                t.on('canplaythrough', function () {
                    t.seek(2);
                    t.each(t.tracks, function (track) {
                        expect(track.attr('currentTime')).to.be(2);
                    });
                    done();
                });
            });
            test('should jump to right time for given float', function (done) {
                t.on('canplaythrough', function () {
                    t.seek(1.0234);
                    t.each(t.tracks, function (track) {
                        expect(Math.round(track.attr('currentTime') * 10000) / 10000).to.equal(1.0234);
                    });
                    done();
                });
            });
        });

        teardown(function () {
            delete els, t;
        });
    });
});

// Sets the runner and run tests as globals that can be accessed by Ghost.py.
var __mocha_tests__ = [];
var __mocha_runner__;

document.addEventListener("DOMContentLoaded", function () {
     __mocha_runner__ = mocha.run().globals(['stats', 'report']).on('test end', function (test) {
        __mocha_tests__.push({title: test.title, state: test.state});
    });
}, false);

isMochaRunning = function () {
    return __mocha_runner__ !== null;
}
