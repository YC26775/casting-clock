import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { fetchData } from './components/fetchData.js';
import Results from './components/Results';
import SiteSearch from './components/SiteSearch';
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
    <div className="app-container">
      <Header />
      <SiteSearch onSearch={setStations} />
      <h2 className="loading-message">
        {isFetchingData && 'Fetching Data...'}
      </h2>
      <StationMap stations={stations} onStationSelect={setSelectedStation} />
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
      <Footer />
    </div>
  );
}

export default App;
