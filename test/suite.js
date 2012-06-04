var helpers = (function() {
    var helpers = {};

    helpers.source = function(src, type) {
        var source = document.createElement('source');
        source.setAttribute('src', src);
        source.setAttribute('type', type);
        return source;
    };

    helpers.audio = function(sources) {
        var el = document.createElement('audio');
        if (sources) {
            for (var i = 0, l = sources.length; i < l; i++) {
                el.appendChild(sources[i]);
            }
        }
        return el;
    };

    return helpers;
})();


suite('tracks', function() {
    suite('#humanizeTime()', function() {
        test('should return a 4 digit fomated string', function() {
            expect(tracks.humanizeTime(184)).to.be("03:04");
        });
        test('should return a 6 digit fomated string when withHours optional argument is set to true', function() {
            expect(tracks.humanizeTime(18445, true)).to.be("05:07:25");
        });
    });

    suite('#toAverage()', function() {
        test('should return a rounded average', function() {
            expect(tracks.toAverage(80, 100)).to.be(80);
            expect(tracks.toAverage(801, 1000)).to.be(80);
            expect(tracks.toAverage(12, 1100)).to.be(1);
        });
        test('should return a rounded decimal average for given values when `precision` arg is provided', function() {
            expect(tracks.toAverage(801, 1000, 2)).to.be(80.10);
            expect(tracks.toAverage(12, 1100, 8)).to.be(1.09090909);
        });
    });

    suite('#fromAverage()', function() {
        test('should return the right integer position', function() {
            expect(tracks.fromAverage(80, 100)).to.be(80);
            expect(tracks.fromAverage(80, 1000)).to.be(800);
        });
        test('should return a rounded integer position', function() {
            expect(tracks.fromAverage(4, 847)).to.be(34);
        });
        test('should return a rounded float position when `precision` arg is provided', function() {
            expect(tracks.fromAverage(4, 847, 1)).to.be(33.9);
            expect(tracks.fromAverage(4, 847, 2)).to.be(33.88);
        });
    });

    suite('Track', function() {
        var el, t;

        setup(function() {
            el = helpers.audio([
                helpers.source('sounds/craw.ogg', 'audio/ogg'),
                helpers.source('sounds/craw.mp3', 'audio/mp3')
            ]);
            t = new tracks.Track(el);
        });

        suite('#attr()', function() {
            test('should set `el` attibute with given value', function() {
                t.attr('rel', 'test');
                expect(el.rel).to.be('test');
            });
            test('should get `el` attibute', function() {
                t.attr('rel', 'test');
                expect(t.attr('rel')).to.be('test');
            });
        });

        suite('#play()', function() {
            test('should be playable when ready', function(done) {
                t.on('canplay', function() {
                    t.play();
                });
                t.on('play', function() {
                    t.pause();
                    done();
                });
            });
        });

        suite('#on()', function() {
            test('should register the given function as a listener for given event type', function(done) {
                t.on('theevent', function() {
                    done();
                });
                var e = document.createEvent('HTMLEvents');
                e.initEvent('theevent', false, true );
                el.dispatchEvent(e);
            });
            test('loadedmetadata should be fired up', function(done) {
                t.on('loadedmetadata', function() {
                    done();
                });
            });
            test('loadeddata should be fired up', function(done) {
                t.on('loadeddata', function() {
                    done();
                });
            });
            test('canplay should be fired up', function(done) {
                t.on('canplay', function() {
                    done();
                });
            });
            test('canplaythrough should be fired up', function(done) {
                t.on('canplaythrough', function() {
                    done();
                });
            });
        });

        teardown(function() {
            delete el, t;
        });
    });

    suite('Tracks', function() {
        var els, t;

        setup(function(done) {
            els = [
                helpers.audio([
                    helpers.source('sounds/craw.ogg', 'audio/ogg'),
                    helpers.source('sounds/craw.mp3', 'audio/mp3')
                ]),
                helpers.audio([
                    helpers.source('sounds/seagull.ogg', 'audio/ogg'),
                    helpers.source('sounds/seagull.mp3', 'audio/mp3')
                ])
            ];
            t = new tracks.Tracks(els);
            done();
        });

        suite('#on()', function() {
            test('loadedmetadata should be fired up', function(done) {
                t.on('loadedmetadata', function() {
                    done();
                });
            });
            test('loadeddata should be fired up', function(done) {
                t.on('loadeddata', function() {
                    done();
                });
            });
            test('canplay should be fired up', function(done) {
                t.on('canplay', function() {
                    done();
                });
            });
            test('canplaythrough should be fired up', function(done) {
                t.on('canplaythrough', function() {
                    done();
                });
            });
        });

        teardown(function() {
            delete els, t;
        });
    });
});
