module.exports = function() {
  var dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  var date = new Date().toLocaleDateString([], dateOptions).split("/");
  var year = date.splice(-1)[0];
  date.splice(0, 0, year);
  var formattedDate = date.join("-");
  return formattedDate;
}
