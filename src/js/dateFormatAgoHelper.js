const monthsToSeconds = (month) =>
  60 * 60 * 24 * new Date(new Date().getFullYear(), month, 0).getDate();

function getMonthInterval(seconds) {
  let month = new Date().getMonth();
  let secondsInMonth = monthsToSeconds(month);
  let interval = 0;

  while (seconds >= secondsInMonth) {
    month -= 1;
    if (month < 0) {
      month += 12;
    }
    seconds -= secondsInMonth;
    secondsInMonth = monthsToSeconds(month);
    interval += 1;
  }

  return interval;
}

// change date into how long ago that date is relative to when view page
export function dateFormatAgoHelper(date) {
  function render(n, unit) {
    return n + ' ' + unit + (n === 1 ? '' : 's') + ' ago';
  }

  let seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / (60 * 60 * 24 * 365));
  switch (true) {
    case interval >= 1:
      return '+1 year ago';
    case (interval = getMonthInterval(seconds)) >= 1:
      return render(interval, 'month');
    case (interval = Math.floor(seconds / (60 * 60 * 24))) >= 1:
      return render(interval, 'day');
    case (interval = Math.floor(seconds / (60 * 60))) >= 1:
      return render(interval, 'hour');
    case (interval = Math.floor(seconds / 60)) >= 1:
      return render(interval, 'minute');
    default:
      return render(seconds, 'second');
  }
}
