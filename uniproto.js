/**
 * Created by Иван on 13.05.2017.
 */

var WM_UniProto = {

   check_header : function (header) {
      return header === '40';
   },

   check_crc : function(data) {
      var mass = data;
      var crc_packet = data[data.length-2]+data[data.length-1];
      mass.pop();
      mass.pop();
      var crc = model.Utilites.crc16(mass);
      return (crc === crc_packet);
   },

   parser : function(data) {
      if(data.length>12) {
          var header_ = data[0];
          if(model.UniProto.check_header(header_)) {
              if(model.UniProto.check_crc(data)) {
                  var len_ = data[1] + data[2];
                  var addr_ = data[3] + data[4];
                  var group_ = data[5];
                  var master_ = data[6];
                  var temp_ = data[7];
                  var socket_ = data[8];
                  var id_ = data[9] + data[10];

                  var systemgroup = -1;
                  switch(group_) {
                      case '11' : systemgroup = 0; break;
                      case '12' : systemgroup = 1; break;
                      case '13' : systemgroup = 2; break;
                      case '14' : systemgroup = 3; break;
                  };
                  var _group = '';
                  var _command = '';
                  var _addr = '';
                  var _len = '';
                  var _data = '';
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
     var pk = '';
     pk = '400013' + '00' + ('0' + device.netaddr).slice(-2) + device.testgroup + 'FFFFFFFF00' + device.testgroup + '03' + device.testregister + '0002';
     return pk;
   },

   setsendbuffer: function(data) {
     var mass = model.Utilites.stringToarrayHex(data);
     var crc = model.Utilites.stringToarrayHex(model.Utilites.crc16(mass));
     mass.push(crc[0]);
     mass.push(crc[1]);
     var packet = model.Utilites.arrayHexToDec(mass);
     var buff = new Buffer(packet);
     return buff;
   }

};

module.exports = WM_UniProto;