var timeEl = document.getElementById("time");
var dateEl = document.getElementById("date");
var localRequestTime;
var offset = 0;

function getTime() {
  var requestStartTime = performance.now();
  var requestEndTime;
  fetch("https://time.djones.co/time")
    .then((response) => {
      requestEndTime = performance.now();
      return response.json();
    })
    .then((data) => {
      var oneWayLatency = (requestEndTime - requestStartTime) / 2;
      localRequestTime = requestStartTime + oneWayLatency;
      offset = data[0] - localRequestTime;
      timeEl.classList.remove("hidden");
      dateEl.classList.remove("hidden");
      console.log(getTimeDiff() / 1000);
    });
}

function isTimeStale() {
  return performance.now() - localRequestTime > 300000;
}

function getTimeIfStale() {
  if (isTimeStale()) {
    getTime();
  }
}

function getTimeDiff() {
  if (offset !== 0) {
    const now = new Date();
    var localTimestamp = now.getTime();
    now.setTime(performance.now() + offset);
    var remoteTimestamp = now.getTime();
    return localTimestamp - remoteTimestamp;
  }
  return null;
}

function displayDateTime() {
  const now = new Date();
  if (offset !== 0) {
    now.setTime(performance.now() + offset);
  }

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const timeString = `${hours}:${minutes}:${seconds}`;

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const dateString = now.toLocaleDateString("en-US", options);

  timeEl.textContent = timeString;
  dateEl.textContent = dateString;
}

window.setInterval(displayDateTime, 100);
window.setTimeout(getTime, 1000);
window.setInterval(getTimeIfStale, 10000);

timeEl.addEventListener("click", getTime);
