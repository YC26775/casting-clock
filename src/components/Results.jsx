import { FiActivity, FiArrowUp, FiTrendingDown, FiTrendingUp, FiX } from 'react-icons/fi';
import { LuWaves } from 'react-icons/lu';
import {
  WiBarometer,
  WiCloud,
  WiCloudy,
  WiDayCloudy,
  WiDaySunny,
  WiFog,
  WiHumidity,
  WiRain,
  WiRaindrop,
  WiShowers,
  WiSnow,
  WiSprinkle,
  WiStrongWind,
  WiThunderstorm,
  WiWindy,
} from 'react-icons/wi';

const DASH = '—';

const isNumeric = (value) =>
  value !== undefined &&
  value !== null &&
  value !== '--' &&
  value !== '' &&
  !Number.isNaN(Number(value));

const fmt = (value, digits = 2) =>
  isNumeric(value)
    ? Number(value).toLocaleString('en-US', { maximumFractionDigits: digits })
    : DASH;

/* Percent difference between the live reading and its seasonal baseline. */
function getDelta(current, baseline) {
  if (!isNumeric(current) || !isNumeric(baseline) || Number(baseline) === 0) {
    return null;
  }
  return ((Number(current) - Number(baseline)) / Number(baseline)) * 100;
}

function Delta({ value, label }) {
  if (value === null) return null;

  const flat = Math.abs(value) < 2;
  const tone = flat ? '' : value > 0 ? ' delta--up' : ' delta--down';
  const Icon = flat ? null : value > 0 ? FiTrendingUp : FiTrendingDown;

  return (
    <span className={`delta${tone}`}>
      {Icon && <Icon aria-hidden="true" />}
      {flat
        ? `Near ${label} normal`
        : `${value > 0 ? '+' : ''}${value.toFixed(0)}% vs ${label} avg`}
    </span>
  );
}

function Metric({ icon, label, children }) {
  return (
    <div className="metric">
      <span className="metric__icon" aria-hidden="true">
        {icon}
      </span>
      <span>
        <span className="metric__label">{label}</span>
        <span className="metric__value">{children}</span>
      </span>
    </div>
  );
}

function Results({
  id,
  onDelete,
  stationName,
  stationNumber,
  cFlow,
  cHeight,
  waterTempF,
  waterTempC,
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
  function getWeatherIcon(code) {
    if (code === 0) return <WiDaySunny />;
    if (code === 1) return <WiDaySunny />;
    if (code === 2) return <WiDayCloudy />;
    if (code === 3) return <WiCloudy />;
    if (code === 45 || code === 48) return <WiFog />;
    if (code >= 51 && code <= 57) return <WiSprinkle />;
    if (code >= 61 && code <= 67) return <WiRain />;
    if (code >= 71 && code <= 77) return <WiSnow />;
    if (code >= 80 && code <= 82) return <WiShowers />;
    if (code === 85 || code === 86) return <WiSnow />;
    if (code >= 95) return <WiThunderstorm />;
    return <WiCloud />;
  }

  const flowDelta = getDelta(cFlow, mFlow);
  const heightDelta = getDelta(cHeight, mHeight);
  const heading = isNumeric(windDir) ? getWindDirection(windDir) : null;

  return (
    <article className="card reading">
      <header className="reading__head">
        <div className="reading__id">
          <span className="reading__mark" aria-hidden="true">
            <LuWaves />
          </span>
          <div>
            <h3 className="reading__name">{stationName}</h3>
            <div className="reading__meta">
              <span className="chip chip--mono">Gauge {stationNumber}</span>
              <span className="chip">
                {month} · {season}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="icon-btn icon-btn--danger"
          onClick={() => onDelete(id)}
          aria-label={`Remove ${stationName}`}
          title="Remove this reading"
        >
          <FiX />
        </button>
      </header>

      <div className="reading__body">
        <section className="panel">
          <h4 className="panel__title">
            <FiActivity aria-hidden="true" />
            Streamflow
          </h4>

          <div className="stat-grid">
            <div className="stat">
              <span className="stat__label">Current flow</span>
              <span className="stat__value">
                {fmt(cFlow)}
                <span className="stat__unit">cfs</span>
              </span>
              <Delta value={flowDelta} label={month} />
            </div>

            <div className="stat">
              <span className="stat__label">Gauge height</span>
              <span className="stat__value">
                {fmt(cHeight)}
                <span className="stat__unit">ft</span>
              </span>
              <Delta value={heightDelta} label={month} />
            </div>

            {/* Only a subset of USGS gauges carry a thermistor. */}
            {isNumeric(waterTempF) && (
              <div className="stat">
                <span className="stat__label">Water temp</span>
                <span className="stat__value">
                  {fmt(waterTempF, 1)}
                  <span className="stat__unit">°F</span>
                </span>
                <span className="delta">{fmt(waterTempC, 1)} °C</span>
              </div>
            )}
          </div>

          <dl className="kv">
            <div className="kv__row">
              <dt>{month} average flow</dt>
              <dd>{fmt(mFlow)} cfs</dd>
            </div>
            <div className="kv__row">
              <dt>{season} average flow</dt>
              <dd>{fmt(sFlow)} cfs</dd>
            </div>
            <div className="kv__row">
              <dt>{month} average height</dt>
              <dd>{fmt(mHeight)} ft</dd>
            </div>
            <div className="kv__row">
              <dt>{season} average height</dt>
              <dd>{fmt(sHeight)} ft</dd>
            </div>
          </dl>
        </section>

        <section className="panel">
          <h4 className="panel__title">
            <WiDaySunny aria-hidden="true" />
            Current weather
          </h4>

          <div className="wx">
            <span className="wx__icon" aria-hidden="true">
              {getWeatherIcon(weatherCode)}
            </span>
            <div>
              <p className="wx__temp">
                {fmt(tempF, 1)}
                <sup>°F</sup>
              </p>
              <p className="wx__desc">{getWeatherDescription(weatherCode)}</p>
              <p className="wx__sub">
                {fmt(tempC, 1)}°C · Feels like {fmt(feelsLike, 1)}°F /{' '}
                {fmt(feelsLikeC, 1)}°C
              </p>
            </div>
          </div>

          <div className="metric-grid">
            <Metric icon={<WiStrongWind />} label="Wind">
              {fmt(windSpeed, 1)} mph{' '}
              {heading && (
                <span className="compass" title={`Wind from ${heading}`}>
                  <FiArrowUp
                    aria-hidden="true"
                    style={{ transform: `rotate(${Number(windDir) + 180}deg)` }}
                  />
                  {heading}
                </span>
              )}
            </Metric>
            <Metric icon={<WiWindy />} label="Gusts">
              {fmt(windGust, 1)} mph
            </Metric>
            <Metric icon={<WiHumidity />} label="Humidity">
              {fmt(hum, 0)}%
            </Metric>
            <Metric icon={<WiRaindrop />} label="Precip">
              {fmt(precip, 2)} in
            </Metric>
            <Metric icon={<WiBarometer />} label="Pressure">
              {fmt(pressure, 1)} hPa
            </Metric>
          </div>
        </section>
      </div>
    </article>
  );
}

export default Results;
