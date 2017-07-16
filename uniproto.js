const Utilites = require('./utilites');
const UniProto = require('./uniproto');

const WM_UniProto = {

   check_header : function (header) {
      return header === '40';
   },

   check_crc : function(data) {
      let mass = data;
      let crc_packet = data[data.length-2]+data[data.length-1];
      mass.pop();
      mass.pop();
      let crc = Utilites.crc16(mass);
      return (crc === crc_packet);
   },

   parser : function(data) {
      let res = [];
      res.result = 0;
      if(data.length>12) {
          res.header = data[0];
          if(this.check_header(res.header)) {
              if(this.check_crc(data)) {
                  res.len = data[1] + data[2];
                  res.addr = data[3] + data[4];
                  res.group = data[5];
                  res.master = data[6];
                  res.temp1 = data[7];
                  res.temp2 = data[8];
                  res.idsocket = data[9];
                  res.idclient = data[10];

                  let systemgroup = -1;
                  switch(res.group) {
                      case '11' : systemgroup = 0; break;
                      case '12' : systemgroup = 1; break;
                      case '13' : systemgroup = 2; break;
                      case '14' : systemgroup = 3; break;
                  };
                  res._group = '';
                  res._command = '';
                  res._addr = '';
                  res._len = '';
                  res._data = '';
                  if(systemgroup<0) { /*данные от интерфейсов*/
                    for(i=11; i<data.length; i++) {
                        res._data += data[i];
                    }
                  } else {            /*системные данные*/
                      res._group = data[11];
                      res._command = data[12];
                      res._addr = data[13]+data[14];
                      res._len = data[15]+data[16];
                      res._data = '';
                      for(i=17; i<data.length; i++) {
                        res._data += data[i];
                      }
                  }
                  res.result = 0;

              } else {
                res.result = 3;
              }
          } else {
              res.result = 2;
          }
      } else {
          res.result = 1;
      }
      return res;
   },

   testdata: function(device) {
     let pk = '';
     pk =  '40';
     pk += '0013';
     pk += Utilites.sprintf("%04X",device.netaddr);
     pk += device.testgroup;
     pk += 'FFFFFFFF00';
     pk += device.testgroup;
     pk += '03' + device.testregister + '0002';
     return pk;
   },

   transitdata: function(device,group,socketid,wsid,data) {
     let pk = '';
     pk =  '40';
     pk += 'LLLL';
     pk += Utilites.sprintf("%04X",device.netaddr);
     pk += Utilites.sprintf("%02X",group);
     pk += 'FFFFFF';
     pk += socketid;
     pk += wsid;
     pk += Utilites.sprintf("%02X",group);
     pk += data;
     let len = (pk.length/2)+2;
     pk = pk.replace('LLLL',Utilites.sprintf("%04X",len));
     return pk;
   },

   setsendbuffer: function(data) {
     let mass = Utilites.stringToarrayHex(data);
     let crc = Utilites.stringToarrayHex(Utilites.crc16(mass));
     mass.push(crc[0]);
     mass.push(crc[1]);
     let packet = Utilites.arrayHexToDec(mass);
     let buff = new Buffer(packet);
     return buff;
   }

};

module.exports = WM_UniProto;