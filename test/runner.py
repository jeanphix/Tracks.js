# -*- coding: utf-8 -*-
import os
import time

import nose

from ghost import Ghost


def test_mocha():
    g = Ghost(display=True, wait_timeout=20)
    index = os.path.abspath(os.path.join(os.path.dirname(__file__), 'index.html'))
    g.open('file://%s' % index)
    g.wait_for(lambda: g.evaluate('isMochaRunning()')[0], 10)
    total =  int(g.evaluate('__mocha_runner__.total')[0])
    n = 0
    while n < total:
        g.wait_for(lambda: g.evaluate('__mocha_tests__.length > %s' % n)[0], 10)

        title = g.evaluate('__mocha_tests__[%s].title' % n)[0]
        state = g.evaluate('__mocha_tests__[%s].state' % n)[0]
        yield check_state, state, title

        n += 1


def check_state(state, title):
    assert state == 'passed'
