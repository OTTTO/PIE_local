function timeConverter(UNIX_timestamp){
  var unixTime = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = unixTime.getFullYear();
  var month = months[unixTime.getMonth()];
  var date = unixTime.getDate();
  var hour = unixTime.getHours();
  var min = unixTime.getMinutes();
  var sec = unixTime.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}

module.exports = { timeConverter };