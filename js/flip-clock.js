<<<<<<< HEAD
function handleTickInit(tick) {
  function updateClock() {
    var d = new Date(); // Get the current date and time

    var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayOfWeek = daysOfWeek[d.getDay()];
    var dayOfWeekAbbreviated = dayOfWeek.slice(0, 4); // Get the abbreviated day of the week

    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var month = months[d.getMonth()];
    var monthAbbreviated = month.slice(0, 3); // Get the abbreviated month

    var hours = d.getHours();
    var ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours || 12;

    var timeSep = ':'; // Separator for hours, minutes, and seconds
    var dateSep = ''; // Separator for the date

    var toUpperCase = true; // Set to true to force all values to be uppercase

    tick.value = {
      dayOfWeek: toUpperCase ? dayOfWeek.toUpperCase() : dayOfWeek,
      dayOfWeekAbbreviated: toUpperCase ? dayOfWeekAbbreviated.toUpperCase() : dayOfWeekAbbreviated,
      date: d.getDate(),
      month: toUpperCase ? month.toUpperCase() : month,
      monthAbbreviated: toUpperCase ? monthAbbreviated.toUpperCase() : monthAbbreviated,
      year: d.getFullYear(),
      hours: hours,
      minutes: d.getMinutes(),
      seconds: d.getSeconds(),
      ampm: toUpperCase ? ampm.toUpperCase() : ampm,
      timeSep: timeSep,
      dateSep: dateSep
    };
  }

  // Call updateClock initially
  updateClock();

  // Update the clock every second
  setInterval(updateClock, 1000);
}
function updateCountdown() {
  // Set the target date and time for New Year's (January 1, next year at 00:00:00)
  const targetDate = new Date(new Date().getFullYear() + 1, 0, 1, 0, 0, 0).getTime();
  const currentDate = new Date().getTime();

  const timeLeft = targetDate - currentDate;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  document.getElementById("days").querySelector(".countdown-number").textContent = days;
  document.getElementById("hours").querySelector(".countdown-number").textContent = hours;
  document.getElementById("minutes").querySelector(".countdown-number").textContent = minutes;
  document.getElementById("seconds").querySelector(".countdown-number").textContent = seconds;
}

// Call updateCountdown initially
updateCountdown();

// Update the countdown clock every second
setInterval(updateCountdown, 1000);
=======
function handleTickInit(tick) {
  function updateClock() {
    var d = new Date(); // Get the current date and time

    var daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayOfWeek = daysOfWeek[d.getDay()];
    var dayOfWeekAbbreviated = dayOfWeek.slice(0, 4); // Get the abbreviated day of the week

    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var month = months[d.getMonth()];
    var monthAbbreviated = month.slice(0, 3); // Get the abbreviated month

    var hours = d.getHours();
    var ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours || 12;

    var timeSep = ':'; // Separator for hours, minutes, and seconds
    var dateSep = ''; // Separator for the date

    var toUpperCase = true; // Set to true to force all values to be uppercase

    tick.value = {
      dayOfWeek: toUpperCase ? dayOfWeek.toUpperCase() : dayOfWeek,
      dayOfWeekAbbreviated: toUpperCase ? dayOfWeekAbbreviated.toUpperCase() : dayOfWeekAbbreviated,
      date: d.getDate(),
      month: toUpperCase ? month.toUpperCase() : month,
      monthAbbreviated: toUpperCase ? monthAbbreviated.toUpperCase() : monthAbbreviated,
      year: d.getFullYear(),
      hours: hours,
      minutes: d.getMinutes(),
      seconds: d.getSeconds(),
      ampm: toUpperCase ? ampm.toUpperCase() : ampm,
      timeSep: timeSep,
      dateSep: dateSep
    };
  }

  // Call updateClock initially
  updateClock();

  // Update the clock every second
  setInterval(updateClock, 1000);
}
function updateCountdown() {
  // Set the target date and time for New Year's (January 1, next year at 00:00:00)
  const targetDate = new Date(new Date().getFullYear() + 1, 0, 1, 0, 0, 0).getTime();
  const currentDate = new Date().getTime();

  const timeLeft = targetDate - currentDate;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  document.getElementById("days").querySelector(".countdown-number").textContent = days;
  document.getElementById("hours").querySelector(".countdown-number").textContent = hours;
  document.getElementById("minutes").querySelector(".countdown-number").textContent = minutes;
  document.getElementById("seconds").querySelector(".countdown-number").textContent = seconds;
}

// Call updateCountdown initially
updateCountdown();

// Update the countdown clock every second
setInterval(updateCountdown, 1000);
>>>>>>> e1245f311ea92b7ef76e1ec31273bc73c4e20511
