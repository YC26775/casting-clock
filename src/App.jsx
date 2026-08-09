import { useState, useEffect } from 'react';
import { FaFish } from 'react-icons/fa';
import { FiClock, FiMap, FiSunrise, FiTrendingUp } from 'react-icons/fi';
import Header from './components/Header';
import Footer from './components/Footer';
import { fetchData } from './components/fetchData.js';
import Results from './components/Results';
import SiteSearch from './components/SiteSearch';
import SkeletonReading from './components/SkeletonReading';
import StationMap from './components/StationMap';
function App() {
  const [dataList, setDataList] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState({});
  const [isFetchingData, setIsFetchingData] = useState(false);
  useEffect(() => {
    if (!selectedStation?.site_no) return;
    console.log('Selected station is', selectedStation);

    const getData = async () => {
      try {
        setIsFetchingData(true);
        const data = await fetchData(
          selectedStation.site_no,
          selectedStation.dec_lat_va,
          selectedStation.dec_long_va
        );
        console.log(data);
        const addDataToList = () => {
          const newData = {
            id: crypto.randomUUID(),
            stationName: selectedStation.station_nm,
            stationNumber: selectedStation.site_no,
            past1HourFlowValueMean: data.currentStream[0],
            past1HourHeightValueMean: data.currentStream[1],
            waterTempF: data.currentStream[2],
            waterTempC: data.currentStream[3],
            monthFlowValueMean: data.seasonalStream[0],
            monthHeightValueMean: data.seasonalStream[1],
            seasonFlowValueMean: data.seasonalStream[2],
            seasonHeightValueMean: data.seasonalStream[3],
            tempF: data.weather.current.temperature_2m,
            feelsLike: data.weather.current.apparent_temperature,
            feelsLikeC: (
              (data.weather.current.apparent_temperature - 32) *
              (5 / 9)
            ).toFixed(1),
            tempC: (
              (data.weather.current.temperature_2m - 32) *
              (5 / 9)
            ).toFixed(1),
            hum: data.weather.current.relative_humidity_2m,
            precip: data.weather.current.precipitation,
            pressure: data.weather.current.surface_pressure,
            weatherCode: data.weather.current.weather_code,
            windDir: data.weather.current.wind_direction_10m,
            windSpeed: data.weather.current.wind_speed_10m,
            windGust: data.weather.current.wind_gusts_10m,
          };
          setDataList((prev) => [newData, ...prev]);
        };
        addDataToList();
      } catch (error) {
        console.log('Error fetching data:', error);
      } finally {
        setIsFetchingData(false);
      }
    };
    getData();
  }, [selectedStation]);

  const deleteItem = (itemId) => {
    setDataList((prevList) => {
      return prevList.filter((item) => item.id !== itemId);
    });
  };
  return (
    <div className="app-shell" id="top">
      <Header />

      <main className="main">
        <section className="wrap hero">
          <p className="eyebrow">
            <span className="eyebrow__dot">
              <FaFish />
            </span>
            Live USGS gauges · hourly weather
          </p>

          <h1 className="hero__title">
            Know when the water is <em>just right</em>
          </h1>

          <p className="hero__lede">
            Casting Clock pulls live streamflow straight from USGS gauges and
            pairs it with on-the-water weather, then measures both against the
            five-year seasonal normal — so you can tell a good day from a wasted
            drive.
          </p>

          <SiteSearch onSearch={setStations} />

          <ul className="hero__chips">
            <li className="chip">
              <FiTrendingUp aria-hidden="true" /> 5-year seasonal baselines
            </li>
            <li className="chip">
              <FiClock aria-hidden="true" /> Hourly flow &amp; height
            </li>
            <li className="chip">
              <FiSunrise aria-hidden="true" /> Wind, pressure &amp; precip
            </li>
          </ul>
        </section>

        <section className="wrap section" id="map">
          <div className="section__head">
            <h2 className="section__title">
              <FiMap aria-hidden="true" />
              Find your water
            </h2>
            <p className="section__hint">
              Click a pin, then “Fetch Data” to add it below.
            </p>
          </div>

          <StationMap stations={stations} onStationSelect={setSelectedStation} />
        </section>

        <section className="wrap section" id="readings">
          <div className="section__head">
            <h2 className="section__title">
              <FiTrendingUp aria-hidden="true" />
              Your readings
            </h2>
            {isFetchingData ? (
              <p className="loading-banner">
                <span className="spinner" aria-hidden="true" />
                Fetching data…
              </p>
            ) : (
              dataList.length > 0 && (
                <p className="section__hint">
                  {dataList.length} spot{dataList.length === 1 ? '' : 's'} being
                  tracked
                </p>
              )
            )}
          </div>

          <div className="readings">
            {isFetchingData && <SkeletonReading />}

            {!isFetchingData && dataList.length === 0 && (
              <div className="empty">
                <span className="empty__icon">
                  <FaFish />
                </span>
                <h3>No readings yet</h3>
                <p>
                  Search a state, drop onto a gauge, and its flow, height and
                  weather will stack up here — newest first.
                </p>
              </div>
            )}

            {dataList.map((item) => {
              return (
                <Results
                  onDelete={deleteItem}
                  key={item.id}
                  id={item.id}
                  stationName={item.stationName}
                  stationNumber={item.stationNumber}
                  cFlow={item.past1HourFlowValueMean}
                  cHeight={item.past1HourHeightValueMean}
                  waterTempF={item.waterTempF}
                  waterTempC={item.waterTempC}
                  mFlow={item.monthFlowValueMean}
                  mHeight={item.monthHeightValueMean}
                  sFlow={item.seasonFlowValueMean}
                  sHeight={item.seasonHeightValueMean}
                  tempF={item.tempF}
                  feelsLike={item.feelsLike}
                  feelsLikeC={item.feelsLikeC}
                  tempC={item.tempC}
                  hum={item.hum}
                  precip={item.precip}
                  pressure={item.pressure}
                  weatherCode={item.weatherCode}
                  windDir={item.windDir}
                  windSpeed={item.windSpeed}
                  windGust={item.windGust}
                />
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
