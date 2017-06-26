
const Utilites = {

    generateSocketID : function(mass){  /*генератор ID сокета*/
        let id = '';
        let min = 1;
        let max = 254;
        while(id == '') {
            id = Utilites.sprintf("%02X",Math.floor(Math.random() * (max - min + 1)) + min);
            mass.forEach(function(item, i, mass) {
                if(item.id == id) {
                    id = '';
                }
            });
        }
        return id;
    },

    generateClientID : function(mass){ /*генератор ID клиента сокета*/
        let id = '';
        let min = 1;
        let max = 254;
        while(id == '') {
            id = Utilites.sprintf("%02X",Math.floor(Math.random() * (max - min + 1)) + min);
            mass.forEach(function(item, i, mass) {
                if(item.id == id) {
                    id = '';
                }
            });
        }
        return id;
    },

    findElement: function(mass,element) {
        let res = false;
        mass.forEach(function(item, i, mass) {
            if(item == element) {
                res = true;
            }
        });
        return res;
    },

    newsession: function(data) {
        let md5 = require("nodejs-md5");
        let res;
        md5.string.quiet(data, function (err, md5) {
            if (err) { }
            else {
                res = md5;
            }
        });
        return res;
    },

    sleep: function(ms) {
            ms += new Date().getTime();
            while (new Date() < ms){}
    },

    datetime: function () {
      let d = new Date();
      let res =   ('0' + d.getDate()).slice(-2) + '.';
          res +=  ('0' + (d.getMonth() + 1)).slice(-2) + '.';
          res +=  d.getFullYear() + ' ';
          res +=  ('0' + d.getHours()).slice(-2) + ':';
          res +=  ('0' + d.getMinutes()).slice(-2) + ':';
          res +=  ('0' + d.getSeconds()).slice(-2);
      return res;
    },

    arrayHexToString: function(data) {
      let i;
      let res = '';
      for(i=0; i<data.length; i++) {
        res += ('0' +data[i]).slice(-2);
      }
      return res;
    },

    stringToarrayHex: function(data) {
        let res = [];
        let i = 0;
        while(i < data.length-1) {
            res.push(data[i]+data[i+1]);
            i = i + 2;
        }
        return res;
    },

    arrayDecToHex: function(data) {
      let res = [];
      let i = 0;
      while(i < data.length) {
         //res.push(data[i].toString(16).toUpperCase());
         res.push(Utilites.sprintf("%02X", data[i]));
         i++;
      }
      return res;
    },

    arrayHexToDec: function(data) {
        let res = [];
        let i = 0;
        while(i < data.length) {
            res.push(parseInt(data[i],16));
            i++;
        }
        return res;
    },

    crc16: function(data) {
        let mass = Utilites.arrayHexToDec(data);
        let crc = 0xFFFF;
        let polinom = 0xA001;
        let len = mass.length;
        let i = 0;
        while(len--) {
                crc ^= mass[i++];
                crc &= 0xffff;
                for (j = 0; j < 8; j++){
                    crc = (crc & 0x0001) ? (crc >> 1) ^ polinom : crc >> 1;
                }
        }
        crc = ((crc&0xFF00)>>8)|((crc&0x00FF)<<8);
        return Utilites.sprintf("%04X",crc);
    },

    hex_to_ascii: function(data) {
        let hex  = data.toString();
        let str = '';
        for (let n = 0; n < hex.length; n += 2) {
          str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
        }
        return str;
    },

    console: function(p) {
       /*
         p[0] - тип данных.
         Для сокетов: 0-лог соединения, 1-лог обмена данными
       */
       if(model.ListSettings['console_'+p[1]+'_'+p[0]] == undefined || model.ListSettings['console_'+p[1]+'_'+p[0]]>0) {
           console.log('[' + p[1] + ' ' + Utilites.datetime() + '] ' + p[2] + ' ' + p[3] + ' ' + p[4]);
       }
    },

    sprintf: function () {
        var regex = /%%|%(\d+\$)?([-+#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
        var a = arguments, i = 0, format = a[i++];

        // pad()
        var pad = function(str, len, chr, leftJustify) {
            var padding = (str.length >= len) ? '' : Array(1 + len - str.length >>> 0).join(chr);
            return leftJustify ? str + padding : padding + str;
        };

        // justify()
        var justify = function(value, prefix, leftJustify, minWidth, zeroPad) {
            var diff = minWidth - value.length;
            if (diff > 0) {
                if (leftJustify || !zeroPad) {
                    value = pad(value, minWidth, ' ', leftJustify);
                } else {
                    value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
                }
            }
            return value;
        };

        // formatBaseX()
        var formatBaseX = function(value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
            // Note: casts negative numbers to positive ones
            var number = value >>> 0;
            prefix = prefix && number && {'2': '0b', '8': '0', '16': '0x'}[base] || '';
            value = prefix + pad(number.toString(base), precision || 0, '0', false);
            return justify(value, prefix, leftJustify, minWidth, zeroPad);
        };

        // formatString()
        var formatString = function(value, leftJustify, minWidth, precision, zeroPad) {
            if (precision != null) {
                value = value.slice(0, precision);
            }
            return justify(value, '', leftJustify, minWidth, zeroPad);
        };

        // finalFormat()
        var doFormat = function(substring, valueIndex, flags, minWidth, _, precision, type) {
            if (substring == '%%') return '%';

            // parse flags
            var leftJustify = false, positivePrefix = '', zeroPad = false, prefixBaseX = false;
            for (var j = 0; flags && j < flags.length; j++) switch (flags.charAt(j)) {
                case ' ': positivePrefix = ' '; break;
                case '+': positivePrefix = '+'; break;
                case '-': leftJustify = true; break;
                case '0': zeroPad = true; break;
                case '#': prefixBaseX = true; break;
            }

            // parameters may be null, undefined, empty-string or real valued
            // we want to ignore null, undefined and empty-string values
            if (!minWidth) {
                minWidth = 0;
            } else if (minWidth == '*') {
                minWidth = +a[i++];
            } else if (minWidth.charAt(0) == '*') {
                minWidth = +a[minWidth.slice(1, -1)];
            } else {
                minWidth = +minWidth;
            }

            // Note: undocumented perl feature:
            if (minWidth < 0) {
                minWidth = -minWidth;
                leftJustify = true;
            }

            if (!isFinite(minWidth)) {
                throw new Error('sprintf: (minimum-)width must be finite');
            }

            if (!precision) {
                precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type == 'd') ? 0 : void(0);
            } else if (precision == '*') {
                precision = +a[i++];
            } else if (precision.charAt(0) == '*') {
                precision = +a[precision.slice(1, -1)];
            } else {
                precision = +precision;
            }

            // grab value using valueIndex if required?
            var value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

            switch (type) {
                case 's': return formatString(String(value), leftJustify, minWidth, precision, zeroPad);
                case 'c': return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
                case 'b': return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'o': return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'x': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'X': return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
                case 'u': return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
                case 'i':
                case 'd': {
                    var number = parseInt(+value);
                    var prefix = number < 0 ? '-' : positivePrefix;
                    value = prefix + pad(String(Math.abs(number)), precision, '0', false);
                    return justify(value, prefix, leftJustify, minWidth, zeroPad);
                }
                case 'e':
                case 'E':
                case 'f':
                case 'F':
                case 'g':
                case 'G':
                {
                    var number = +value;
                    var prefix = number < 0 ? '-' : positivePrefix;
                    var method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
                    var textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(type) % 2];
                    value = prefix + Math.abs(number)[method](precision);
                    return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
                }
                default: return substring;
            }
        };

        return format.replace(regex, doFormat);
    }


};


module.exports = Utilites;