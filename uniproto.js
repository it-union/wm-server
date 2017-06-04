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
      if(data.length>12) {
          let header_ = data[0];
          if(this.check_header(header_)) {
              if(this.check_crc(data)) {
                  let len_ = data[1] + data[2];
                  let addr_ = data[3] + data[4];
                  let group_ = data[5];
                  let master_ = data[6];
                  let temp_ = data[7];
                  let socket_ = data[8];
                  let id_ = data[9] + data[10];

                  let systemgroup = -1;
                  switch(group_) {
                      case '11' : systemgroup = 0; break;
                      case '12' : systemgroup = 1; break;
                      case '13' : systemgroup = 2; break;
                      case '14' : systemgroup = 3; break;
                  };
                  let _group = '';
                  let _command = '';
                  let _addr = '';
                  let _len = '';
                  let _data = '';
                  if(systemgroup<0) { /*данные от интерфейсов*/
                    for(i=11; i<data.length-2; i++) {
                       _data += data[i];
                    }
                  } else {            /*системные данные*/
                    _group = data[11];
                    _command = data[12];
                    _addr = data[13]+data[14];
                    _len = data[15]+data[16];
                    _data = '';
                    for(i=17; i<data.length; i++) {
                       _data += data[i];
                    }
                  }
                  return [0,header_,len_,addr_,group_,master_,temp_,socket_,id_,_group,_command,_addr,_len,_data];

              } else {
                return [3];
              }
          } else {
            return [2];
          }
      } else {
         return [1];
      }

   },

   testdata: function(device) {
     let pk = '';
     pk = '400013' + '00' + ('0' + device.netaddr).slice(-2) + device.testgroup + 'FFFFFFFF00' + device.testgroup + '03' + device.testregister + '0002';
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