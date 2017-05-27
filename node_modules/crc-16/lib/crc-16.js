'use strict';


function crc16(buf) {
  if (!Buffer.isBuffer(buf)) {
    throw new TypeError('Error: argument ' + typeof buf + ' is not an allowed type.');
  }

  var crc = 0xffff >>> 0;
  var len = buf.length;
  var i = 0;
  var j = 0;

  for (i = 0; i < len; i++) {
    var byte = buf[i];

    for (j = 0; j < 8; j++) {
      var temp = (0xffff & (crc ^ byte)) >>> 0;

      if ((temp & 0x01) > 0) {
        crc = crc >>> 1;
        crc = (0xffff & ((crc ^ 0x8408) >>> 0)) >>> 0;
      } else {
        crc = (crc >> 1) >>> 0;
      }

      byte = (byte >> 1) >>> 0;
    }
  }
  return [(~crc & 0xff), (~crc >>> 8 & 0xff)];
}

module.exports = crc16;
