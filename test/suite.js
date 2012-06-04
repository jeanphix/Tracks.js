suite('tracks', function() {

    setup(function(done) {
        done();
    });

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
            expect(tracks.fromAverage(4, 847, 1)).to.be(33.8);
            expect(tracks.fromAverage(4, 847)).to.be(33.88);
        });
    });
});
