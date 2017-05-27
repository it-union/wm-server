'use strict';


var chai = require('chai');
var mocha = require('mocha');
var crc16 = require('../lib/crc-16');

var expect = chai.expect;


// simple 2 byte CRC calculation test
describe('CRC-16', function () {
  it('should have returned [ 0x47 , 0x0f ] given the input [ 0x00 , 0x00 ]', function () {
    const buf = new Buffer([0,0]);
    var crc = new Buffer(crc16(buf));
    expect(crc.equals(new Buffer([0x47, 0x0f]))).is.true;
  });
});
