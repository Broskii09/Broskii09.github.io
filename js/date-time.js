<<<<<<< HEAD
$(document).ready(function () {
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var allCaps = true; // Set to true to display text in all caps, or false to display it in lowercase

  setInterval(function () {
    var currentDate = new Date();
    var month = monthNames[currentDate.getMonth()];
    var shortmonth = shortMonthNames[currentDate.getMonth()];
    var day = dayNames[currentDate.getDay()];
    var date = currentDate.getDate();
    var year = currentDate.getFullYear();
	  
    var options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    var timeString = currentDate.toLocaleTimeString('en-US', options);
	
	  
    // Update the HTML elements with the current date and time
    if (allCaps) {
      $('#date').html(date);
      $('#time').html(timeString.toUpperCase());
      $('#month').html(month.toUpperCase() + ' ' + date);
      $('#shortMonth').html(shortmonth.toUpperCase());
      $('#day').html(day.toUpperCase());
      $('#year').html(year);
      $('#dayMonthDate').html(day.toUpperCase() + ', ' + shortmonth.toUpperCase() + ' ' + date);
    } else {
      $('#date').html(date);
      $('#time').html(timeString);
      $('#month').html(month + ' ' + date);
      $('#shortMonth').html(shortmonth);
      $('#day').html(day);
      $('#year').html(year);
      $('#dayMonthDate').html(day + ', ' + shortmonth + ' ' + date);
    }

    // Make a request to the OpenWeatherMap API to get the current temperature
    fetch('https://api.openweathermap.org/data/2.5/weather?lat=37.97&lon=-87.56&units=imperial&appid=5620c2b78e6d891924652304a96849ac')
      .then(response => response.json())
      .then(data => {
        var temperature = data.main.temp;
        // Update the HTML element with the current temperature
        $('#temperature').html(temperature + '°F');
      });
  }, 1000);
  setInterval(function () {
    $('.time-display::before, .time-display::after').toggleClass('hidden');
  }, 500);
});
=======
$(document).ready(function () {
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var allCaps = true; // Set to true to display text in all caps, or false to display it in lowercase

  setInterval(function () {
    var currentDate = new Date();
    var month = monthNames[currentDate.getMonth()];
    var shortmonth = shortMonthNames[currentDate.getMonth()];
    var day = dayNames[currentDate.getDay()];
    var date = currentDate.getDate();
    var year = currentDate.getFullYear();
	  
    var options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    var timeString = currentDate.toLocaleTimeString('en-US', options);
	
	  
    // Update the HTML elements with the current date and time
    if (allCaps) {
      $('#date').html(date);
      $('#time').html(timeString.toUpperCase());
      $('#month').html(month.toUpperCase() + ' ' + date);
      $('#shortMonth').html(shortmonth.toUpperCase());
      $('#day').html(day.toUpperCase());
      $('#year').html(year);
      $('#dayMonthDate').html(day.toUpperCase() + ', ' + shortmonth.toUpperCase() + ' ' + date);
    } else {
      $('#date').html(date);
      $('#time').html(timeString);
      $('#month').html(month + ' ' + date);
      $('#shortMonth').html(shortmonth);
      $('#day').html(day);
      $('#year').html(year);
      $('#dayMonthDate').html(day + ', ' + shortmonth + ' ' + date);
    }

    // Make a request to the OpenWeatherMap API to get the current temperature
    fetch('https://api.openweathermap.org/data/2.5/weather?lat=37.97&lon=-87.56&units=imperial&appid=5620c2b78e6d891924652304a96849ac')
      .then(response => response.json())
      .then(data => {
        var temperature = data.main.temp;
        // Update the HTML element with the current temperature
        $('#temperature').html(temperature + '°F');
      });
  }, 1000);
  setInterval(function () {
    $('.time-display::before, .time-display::after').toggleClass('hidden');
  }, 500);
});
>>>>>>> e1245f311ea92b7ef76e1ec31273bc73c4e20511
