function timeConverter(UNIX_timestamp) {
  var unixTime = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = unixTime.getFullYear();
  var month = unixTime.getMonth();
  var date = unixTime.getDate();
  var hour = unixTime.getHours();
  var min = unixTime.getMinutes();
  var sec = unixTime.getSeconds();
  var time = `${date}/${month+1}/${year}`
  return time;
}

function dateToday() {
  return new Date().setHours(0, 0, 0, 0);
}

function fixTime(date) {
  date.setHours(date.getHours() + 5);
}

//module.exports = { timeConverter, dateToday, fixTime };