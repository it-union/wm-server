/**
 * Created by Иван on 12.05.2017.
 */

var Utilites = {

    sleep: function(ms) {
            ms += new Date().getTime();
            while (new Date() < ms){}
    },

    datetime: function () {
      var d = new Date();
      var res =   ('0' + d.getDate()).slice(-2) + '.';
          res +=  ('0' + (d.getMonth() + 1)).slice(-2) + '.';
          res +=  d.getFullYear() + ' ';
          res +=  ('0' + d.getHours()).slice(-2) + ':';
          res +=  ('0' + d.getMinutes()).slice(-2) + ':';
          res +=  ('0' + d.getSeconds()).slice(-2);
      return res;
    },

    arrayHexToString: function(data) {
      var i;
      var res = '';
      for(i=0; i<data.length; i++) {
        res += ('0' +data[i]).slice(-2);
      }
      return res;
    },

    stringToarrayHex: function(data) {
        var res = [];
        var i = 0;
        while(i < data.length-1) {
            res.push(data[i]+data[i+1]);
            i = i + 2;
        }
        return res;
    },

    arrayDecToHex: function(data) {
      var res = [];
      var i = 0;
      while(i < data.length) {
         res.push(data[i].toString(16).toUpperCase());
         i++;
      }
      return res;
    },

    arrayHexToDec: function(data) {
        var res = [];
        var i = 0;
        while(i < data.length) {
            res.push(parseInt(data[i],16));
            i++;
        }
        return res;
    },

    crc16: function(data) {
         var mass = model.Utilites.arrayHexToDec(data);
         var crc = 0xFFFF;
         var polinom = 0xA001;
         var len = mass.length;
         var i = 0;
         while(len--) {
                crc ^= mass[i++];
                crc &= 0xffff;
                for (j = 0; j < 8; j++){
                    crc = (crc & 0x0001) ? (crc >> 1) ^ polinom : crc >> 1;
                }
         }
         crc = ((crc&0xFF00)>>8)|((crc&0x00FF)<<8);
         return crc.toString(16).toUpperCase();
    },

    hex_to_ascii: function(data) {
        var hex  = data.toString();
        var str = '';
        for (var n = 0; n < hex.length; n += 2) {
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
           console.log('[' + p[1] + ' ' + model.Utilites.datetime() + '] ' + p[2] + ' ' + p[3] + ' ' + p[4]);
       }
    }

};

module.exports = Utilites;