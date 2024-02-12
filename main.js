const API_KEY = `4280b71bc13f8c348077eb429ce214d5`;
let lat;
let lon;
let city;
let temp;
let currentWeather;
let tempMin;
let tempMax;
let sunrise;
let sunset;
let tempKelvin = 276.56;
let searchHistoryList = [];
let pageNumber = 1;
const weatherInfo = document.getElementById("weather_info");
let locationSearchInput = document.getElementById("location__searchInput");
const searchHistory = document.getElementById("search_history__list");
const itemsPerPage = 5;
const paginationContainer = document.getElementById("pagination");
const timeSpace = document.getElementById("time-space");

locationSearchInput.addEventListener("keydown", handleKeyPress);
function handleKeyPress(event) {
  if (event.key === "Enter") {
    getLocation();
    locationSearchInput.value = null;
  }
}

const getNowLocation = (position) => {
  navigator.geolocation.getCurrentPosition((position) => {
    lat = position.coords.latitude;
    lon = position.coords.longitude;

    initMap();
    getWeatherInfo();
  });
};

const getLocation = () => {
  try {
    city = locationSearchInput.value;
    getGeolocation(city);

    locationSearchInput.value = null;
  } catch (err) {
    console.log(err);
  }
};

//일단 인풋창에 london이라고 작성한 것으로
const getGeolocationUrl = new URL(
  ` http://api.openweathermap.org/geo/1.0/direct?limit=1&appid=${API_KEY}`
);

//검색 지역 날씨 정보
const getGeolocation = async (city) => {
  try {
    getGeolocationUrl.searchParams.set("q", city);
    let response = await fetch(getGeolocationUrl);
    let data = await response.json();
    lat = data[0].lat;
    lon = data[0].lon;
    searchHistoryList.push(city.toLowerCase());
    window.initMap();
    getWeatherInfo(city);
  } catch (error) {
    errorRender(error);
  }
};

const url = new URL(
  `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}`
);

//한국 시간 변환기
const humanReadableTimeKorea = (time) => {
  let utcTime = new Date(time * 1000); // Convert to UTC
  let timeInKr = new Date(utcTime.getTime());
  return timeInKr;
};

const date = new Date();
const localTime = `현재 시각 : ${date.getHours()}시 ${date.getMinutes()}분`;
timeSpace.innerHTML = localTime;

const getWeatherInfo = async () => {
  try {
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    let response = await fetch(url);
    let data = await response.json();
    temp = Math.ceil(data.main.temp - tempKelvin);
    city = data.name;
    currentWeather = data.weather[0].main;
    tempMin = Math.ceil(data.main.temp_min - tempKelvin);
    tempMax = Math.ceil(data.main.temp_max - tempKelvin);
    sunrise = humanReadableTimeKorea(data.sys.sunrise);
    sunset = humanReadableTimeKorea(data.sys.sunset);

    historyRender(pageNumber);

    render();
  } catch (error) {
    errorRender(error);
  }
};

const historyRender = (pageNumber) => {
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  searchHistoryList = searchHistoryList.filter((value, index, self) => {
    return self.indexOf(value) === index;
  });
  const pageItems = searchHistoryList.slice(startIndex, endIndex);
  let historyHTML = pageItems
    .map(
      (item) =>
        ` <li class='history-item'><a class="history-link" onclick=getGeolocation(event.target.textContent)>${item}</a>
        <i class="fa-solid fa-trash" onclick=deleteList(searchHistoryList,event)></i></li>`
    )
    .join("");

  searchHistory.innerHTML = historyHTML;

  updatePagination();
};

const deleteList = (searchHistoryList, event) => {
  city = event.target.previousElementSibling.textContent;
  for (let i = 0; i < searchHistoryList.length; i++) {
    if (city == searchHistoryList[i]) {
      const index = searchHistoryList.indexOf(searchHistoryList[i]);
      if (index > -1) {
        // only splice array when item is found
        searchHistoryList.splice(index, 1); // 2nd parameter means remove one item only
      }
    }
  }
  historyRender(pageNumber);
  updatePagination();
};
//getGeolocation(event.target.previousElementSibling.textContent)

function updatePagination() {
  let pageItem = [];

  const totalPages = Math.ceil(searchHistoryList.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    pageNumber = i;
    pageItem += `<li class="page-item"><a class="page-link" onclick=historyRender(${pageNumber})>${pageNumber}</a></li>`;
  }

  paginationContainer.innerHTML = pageItem;
}
const errorRender = (error) => {
  weatherInfo.innerHTML = `<div class="alert alert-danger" role="alert">
  검색하신 위치를 찾을 수 없습니다!!
</div>`;
};

const render = () => {
  let cityHTML = "";
  cityHTML = `<div class="weather">
  <div>지역: ${city}</div>
  <div>현재온도 :  ${temp}</div>
  <div>날씨 :  ${currentWeather}</div>
  <div>현재 최고 온도 : ${tempMax} 현재 최저 온도 : ${tempMin}</div>
  <div>일출 시간 : ${sunrise}  </div> 
  <div>일몰 시간 :  ${sunset}</div></div>
  `;

  weatherInfo.innerHTML = cityHTML;
};
let map;
async function initMap() {
  lat = parseFloat(lat);
  lon = parseFloat(lon);
  const { Map } = await google.maps.importLibrary("maps");
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: lat, lng: lon },
    zoom: 10,
  });
  let markerLocation = new Object();
  markerLocation.label = "H";
  markerLocation.lat = lat;
  markerLocation.lng = lon;

  const marker = new google.maps.Marker({
    position: { lat: markerLocation.lat, lng: markerLocation.lng },
    label: markerLocation.label,
    map,
  });
}

getNowLocation();
