/*!
 * promised-handlebars <https://github.com/nknapp/promised-handlebars>
 *
 * Copyright (c) 2015 Nils Knappmeier.
 * Released under the MIT license.
 */

/* global describe */
/* global it */
// /* global xdescribe */
// /* global xit */

'use strict'

var Q = require('q')

// Chai Setup
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var expect = chai.expect;

// Handlebars-Setup
var promisedHandlebars = require('../')
var Handlebars = promisedHandlebars(require('handlebars'))

Handlebars.registerHelper({
  'helper': function (delay, value) {
    return Q.delay(delay).then(function () {
      return 'h(' + value + ')'
    })
  },
  'block': function (delay, value, options) {
    return Q.delay(delay).then(function () {
      return 'b(' + options.fn(value) + ')'
    })
  }
})

Handlebars.registerPartial('a',"{{helper '10' 'partialA'}}")
Handlebars.registerPartial('b',"{{helper '10' 'partialB'}}")

describe('promised-handlebars:', function () {
  xit('should return a promise for the ouput with helpers resolved', function (done) {
    var template = Handlebars.compile(fixture('simple-helper.hbs'))
    return expect(template({a: 'abc', b: 'xyz'}))
      .to.eventually.equal('123 h(abc) 456 h(xyz)')
      .notify(done);
  })

  xit('should work with block helpers that call `fn` while resolving a promise', function (done) {
    var template = Handlebars.compile(fixture('block-helper.hbs'))
    return expect(template({a: 'abc', b: 'xyz'}))
      .to.eventually.equal('123 b(abc) 456')
      .notify(done);
  })

  xit('should work with a helper being called from within a block helpers', function (done) {
    var template = Handlebars.compile(fixture('nested-helpers.hbs'))
    return expect(template({a: 'abc', b: 'xyz'}))
      .to.eventually.equal('123 b(h(abc)) 456')
      .notify(done);
  })

  xit('should handle {{expr}} and {{{expr}}} like Handlebars does', function (done) {
    var template = Handlebars.compile(fixture('escaping.hbs'))
    return expect(template({a: '<a>' , b: '<b>'}))
      .to.eventually.equal('raw: <a> h(<a>) esc: &lt;a&gt; h(&lt;a&gt;)')
      .notify(done);

  })

  it('should work correctly when partials are called', function (done) {
    var template = Handlebars.compile(fixture('partials.hbs'))
    return expect(template({a: 'aa' , b: 'bb'}))
      .to.eventually.equal('h(partialA) 123 h(aa) h(partialB) 456 h(bb)')
      .notify(done);
  })
})


function fixture (file) {
  var fs = require('fs')
  return fs.readFileSync(require.resolve('./fixtures/' + file), {encoding: 'utf-8'}).trim()
}

;
