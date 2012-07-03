var casper = require('casper').create();

casper.start('index.html');


casper.waitFor(function isMochaRunning () {
    return this.evaluate(function() {
       return __mocha_runner__ !==null;
    });
}, function then() {
    var total = parseInt(this.evaluate(function() { return __mocha_runner__.total; }));  // Total tests to be run.
    var next = 0;  // Last reported test.

    while (next <= total) {
        while (this.getGlobal('__mocha_tests__').length <= next) {
            // Waits while next test is run.
            this.wait(0.1);
        }

        var test = this.getGlobal('__mocha_tests__')[next];
        this.test.assertEqual(test.state, 'passed', test.title);
        next+= 1;
    }
});

casper.run(function() {
    this.test.renderResults(true);
});
