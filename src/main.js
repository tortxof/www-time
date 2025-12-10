var timeEl = document.getElementById("time");
var dateEl = document.getElementById("date");
var statusEl = document.getElementById("status");
var timeDiffEl = document.getElementById("time-diff");
var hourHand = document.querySelector(".hour-hand");
var minuteHand = document.querySelector(".minute-hand");
var secondHand = document.querySelector(".second-hand");
var subsecondHand = document.querySelector(".subsecond-hand");

// Max number of offsets to keep.
const cache_length = 11;

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

// Create hour markers for the analog clock
function createHourMarkers() {
  const svg = document.querySelector(".analog-clock");
  const centerX = 100;
  const centerY = 100;
  const radius = 95;
  const markerLength = 10;

  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 * Math.PI) / 180; // 30 degrees per hour
    const x1 = centerX + (radius - markerLength) * Math.sin(angle);
    const y1 = centerY - (radius - markerLength) * Math.cos(angle);
    const x2 = centerX + radius * Math.sin(angle);
    const y2 = centerY - radius * Math.cos(angle);

    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    marker.setAttribute("class", "marker");
    marker.setAttribute("x1", x1);
    marker.setAttribute("y1", y1);
    marker.setAttribute("x2", x2);
    marker.setAttribute("y2", y2);

    // Insert before the hands (which are at the end)
    svg.insertBefore(marker, svg.querySelector(".hour-hand"));
  }
}

// Create quarter-second markers for the subsecond clock
function createQuarterSecondMarkers() {
  const svg = document.querySelector(".analog-clock");
  const centerX = 182;
  const centerY = 182;
  const radius = 15;
  const markerLength = 3;

  for (let i = 0; i < 4; i++) {
    const angle = (i * 90 * Math.PI) / 180; // 90 degrees per quarter
    const x1 = centerX + (radius - markerLength) * Math.sin(angle);
    const y1 = centerY - (radius - markerLength) * Math.cos(angle);
    const x2 = centerX + radius * Math.sin(angle);
    const y2 = centerY - radius * Math.cos(angle);

    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    marker.setAttribute("class", "subsecond-marker");
    marker.setAttribute("x1", x1);
    marker.setAttribute("y1", y1);
    marker.setAttribute("x2", x2);
    marker.setAttribute("y2", y2);

    // Insert before the subsecond hand
    svg
      .querySelector(".subsecond-hand")
      .parentNode.insertBefore(marker, svg.querySelector(".subsecond-hand"));
  }
}

// Update analog clock hands based on current time
function updateClockHands(now) {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();

  // Calculate rotations for each hand
  // Hour hand: 30 degrees per hour + 0.5 degrees per minute
  const hourRotation = (hours % 12) * 30 + minutes * 0.5;

  // Minute hand: 6 degrees per minute + 0.1 degrees per second
  const minuteRotation = minutes * 6 + seconds * 0.1;

  // Second hand: 6 degrees per second
  const secondRotation = seconds * 6;

  // Apply rotations to the hands
  hourHand.style.transform = `rotate(${hourRotation}deg)`;
  minuteHand.style.transform = `rotate(${minuteRotation}deg)`;
  secondHand.style.transform = `rotate(${secondRotation}deg)`;

  // Subsecond hand: 360 degrees per second using milliseconds
  const subsecondRotation = (milliseconds / 1000) * 360;

  // Apply rotation to subsecond hand
  subsecondHand.style.transform = `rotate(${subsecondRotation}deg)`;
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
      offsets = offsets.slice(-cache_length);
      // If there is an even number of offsets, don't use the oldest one. We
      // want an odd number of offsets.
      var offsets_for_median;
      if (offsets.length % 2 == 0) {
        offsets_for_median = offsets.slice(1);
      } else {
        offsets_for_median = offsets.slice();
      }
      offset = offsets_for_median.sort((a, b) => a - b)[
        Math.floor(offsets_for_median.length / 2)
      ];
      setStatusColorSynced();
      // Display the time difference in seconds (local time - server time)
      const timeDiff = getTimeDiff() / 1000;
      timeDiffEl.textContent = timeDiff.toLocaleString("en-US", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
        signDisplay: "exceptZero",
      });
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

  // Update analog clock hands
  updateClockHands(now);

  window.requestAnimationFrame(displayDateTime);
}

// Initialize everything when the page loads
document.addEventListener("DOMContentLoaded", function () {
  createHourMarkers();
  createQuarterSecondMarkers();
  getTime();
  displayDateTime();
  window.setInterval(getTimeIfStale, 1000);
});
