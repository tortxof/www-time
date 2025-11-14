var timeEl = document.getElementById("time");
var dateEl = document.getElementById("date");
var statusEl = document.getElementById("status");
var timeDiffEl = document.getElementById("time-diff");
var localRequestTime = null;
var offset = 0;

function setStatusColorSynced() {
  statusEl.classList.add("status-synced");
  statusEl.classList.remove("status-stale");
}

function setStatusColorStale() {
  statusEl.classList.add("status-stale");
  statusEl.classList.remove("status-synced");
}

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
      setStatusColorSynced();
      timeDiffEl.textContent = (getTimeDiff() / 1000).toFixed(3);
    })
    .catch((error) => {
      localRequestTime = null;
      setStatusColorStale();
    });
}

function isTimeStale() {
  const isStale =
    localRequestTime === null || performance.now() - localRequestTime > 300000;
  if (isStale) {
    setStatusColorStale();
  } else {
    setStatusColorSynced();
  }
  return isStale;
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
