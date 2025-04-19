function Results({
  id,
  onDelete,
  stationName,
  stationNumber,
  cFlow,
  cHeight,
  mFlow,
  mHeight,
  sFlow,
  sHeight,
  tempF,
  feelsLike,
  feelsLikeC,
  tempC,
  hum,
  precip,
  pressure,
  weatherCode,
  windDir,
  windSpeed,
  windGust,
}) {
  const date = new Date();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const season = getSeason();
  function getSeason() {
    const date = new Date();
    const month = date.getMonth();

    if (month >= 2 && month <= 4) {
      return 'Spring';
    } else if (month >= 5 && month <= 7) {
      return 'Summer';
    } else if (month >= 8 && month <= 10) {
      return 'Fall';
    } else {
      return 'Winter';
    }
  }
  function getWindDirection(degree) {
    const directions = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ];
    const index = Math.floor((degree + 11.25) / 22.5);
    return directions[index % 16];
  }
  function getWeatherDescription(code) {
    const weatherCodes = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Drizzle: Light intensity',
      53: 'Drizzle: Moderate intensity',
      55: 'Drizzle: Dense intensity',
      56: 'Freezing Drizzle: Light intensity',
      57: 'Freezing Drizzle: Dense intensity',
      61: 'Rain: Slight intensity',
      63: 'Rain: Moderate intensity',
      65: 'Rain: Heavy intensity',
      66: 'Freezing Rain: Light intensity',
      67: 'Freezing Rain: Heavy intensity',
      71: 'Snow fall: Slight intensity',
      73: 'Snow fall: Moderate intensity',
      75: 'Snow fall: Heavy intensity',
      77: 'Snow grains',
      80: 'Rain showers: Slight',
      81: 'Rain showers: Moderate',
      82: 'Rain showers: Violent',
      85: 'Snow showers slight',
      86: 'Snow showers heavy',
      95: 'Thunderstorm: Slight or moderate',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail',
    };

    return weatherCodes[code] || 'Unknown weather code';
  }
  return (
    <div className="results">
      <div className="streamResult">
        <h2>Stream Data</h2>
        <ul>
          <li>Station name : {stationName}</li>
          <li>Station number: {'0' + stationNumber}</li>
          <li>Current flow: {cFlow} cfs</li>
          <li>
            Average flow in {month}: {mFlow} cfs
          </li>
          <li>
            Average flow in {season}:{sFlow} cfs
          </li>
          <li>Current height: {cHeight} ft</li>
          <li>
            Average height in {month}: {mHeight} ft
          </li>
          <li>
            Average flow in {season}: {sHeight} ft
          </li>
        </ul>
      </div>
      <div className="weatherResult">
        <h2>Current Weather Data</h2>
        <ul>
          <li className="weather-description">
            Weather : {getWeatherDescription(weatherCode)}
          </li>
          <li>
            Temperature : {tempF} °F / {tempC} °C
          </li>
          <li>
            Feels like : {feelsLike} °F / {feelsLikeC} °C
          </li>
          <li>
            Wind Speed : {windSpeed} mph{' '}
            <span className="wind-direction">{getWindDirection(windDir)}</span>
          </li>
          <li>Wind Gust : {windGust} mph</li>
          <li>Humidity : {hum} %</li>
          <li>Rain : {precip} inches</li>
          <li>Pressure: {pressure} inches</li>
        </ul>
      </div>
      <button onClick={() => onDelete(id)}>Remove</button>
    </div>
  );
}

export default Results;
