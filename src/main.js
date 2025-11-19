var timeEl = document.getElementById("time");
var dateEl = document.getElementById("date");
var statusEl = document.getElementById("status");
var timeDiffEl = document.getElementById("time-diff");

// This is the estimated local time, as returned by performance.now(), at which
// the server produced it's response. It is calculated as the time the request
// started plus half of the time that the request/response cycle took to
// complete.
var localRequestTime = null;

// The offset is the difference between server time (unix timestamp) and the
// estimated local time when the server produced its response. It represents how
// much ahead the server time is compared to the client's estimated time when
// the response was produced.
var offsets = [];
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
      // Calculate the difference between server time and our estimated local
      // time when the server produced its response
      offsets.push(data[0] - localRequestTime);
      offsets = offsets.slice(-6);
      offset = offsets.reduce((acc, curr) => acc + curr, 0) / offsets.length;
      setStatusColorSynced();
      // Display the time difference in seconds (local time - server time)
      timeDiffEl.textContent = (getTimeDiff() / 1000).toFixed(3);
    })
    .catch((error) => {
      localRequestTime = null;
      setStatusColorStale();
    });
}

function isTimeStale() {
  return (
    localRequestTime === null || performance.now() - localRequestTime > 10000
  );
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
    // Calculate what the server time would be at this moment
    now.setTime(performance.now() + offset);
    var remoteTimestamp = now.getTime();
    // Return the difference between local time and server time
    return localTimestamp - remoteTimestamp;
  }
  return null;
}

function displayDateTime() {
  const now = new Date();
  if (offset !== 0) {
    // Set the date to the current server time by adding the offset to the
    // current local time (performance.now()) and using that as the timestamp
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

  window.requestAnimationFrame(displayDateTime);
}

getTime();
displayDateTime();
window.setInterval(getTimeIfStale, 1000);
