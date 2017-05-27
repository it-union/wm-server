# CRC-16

>Calculates the 16-bit cyclic redundancy check (CRC) used in IrDA & PPP.

## Install

```
$ npm install --save get-port
```


## Usage

```js
// For node@4.4
var crc16 = require('crc-16');

// Calculate the CRC of a simple two-byte buffer
var buf = new Buffer([0x00, 0x00]);
var crc = crc16(buf);

console.log('crc:', crc);

//=> crc: <Buffer 0x47 0x0f>
```

## License

MIT