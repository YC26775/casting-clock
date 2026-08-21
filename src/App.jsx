import { useState, useEffect, useRef } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import Header from './components/Header';
import { fetchData } from './components/fetchData.js';
import Results from './components/Results';
import SkeletonReading from './components/SkeletonReading';
import StationMap from './components/StationMap';
/* Snap points for the mobile bottom sheet, as a share of viewport height.
   Kept in step with the --sheet-* custom properties in style.css. */
const SNAP_POINTS = { peek: 0.09, half: 0.55, full: 0.92 };
const isSheetLayout = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(max-width: 1100px)').matches;

function App() {
  const [dataList, setDataList] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState({});
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [sheet, setSheet] = useState('half');
  const panelRef = useRef(null);
  const dragRef = useRef(null);

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

  /* Dragging writes the live height straight onto the element so the sheet
     tracks the finger at frame rate instead of via a state round-trip; the
     snap decision on release is the only thing that touches React state. */
  const handlePointerDown = (event) => {
    if (!isSheetLayout()) return;
    const panel = panelRef.current;
    if (!panel) return;

    dragRef.current = {
      startY: event.clientY,
      startHeight: panel.getBoundingClientRect().height,
      moved: false,
    };
    panel.dataset.dragging = 'true';
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    const panel = panelRef.current;
    if (!drag || !panel) return;

    const delta = drag.startY - event.clientY;
    if (Math.abs(delta) > 4) drag.moved = true;

    const max = window.innerHeight * SNAP_POINTS.full;
    const min = window.innerHeight * SNAP_POINTS.peek;
    const next = Math.min(max, Math.max(min, drag.startHeight + delta));
    panel.style.setProperty('--sheet-h', `${next}px`);
  };

  const endDrag = (event) => {
    const drag = dragRef.current;
    const panel = panelRef.current;
    if (!drag || !panel) return;
    dragRef.current = null;

    if (drag.moved) {
      const ratio = panel.getBoundingClientRect().height / window.innerHeight;
      const nearest = Object.keys(SNAP_POINTS).reduce((best, key) =>
        Math.abs(SNAP_POINTS[key] - ratio) < Math.abs(SNAP_POINTS[best] - ratio)
          ? key
          : best
      );
      setSheet(nearest);
    } else {
      // A plain tap cycles rather than doing nothing.
      setSheet((current) =>
        current === 'full' ? 'half' : current === 'half' ? 'peek' : 'full'
      );
    }

    panel.style.removeProperty('--sheet-h');
    delete panel.dataset.dragging;

    // pointercancel has already dropped the capture, and asking again throws.
    try {
      event?.currentTarget?.releasePointerCapture?.(event.pointerId);
    } catch {
      // nothing to release — the gesture is over either way
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSheet((c) => (c === 'peek' ? 'half' : 'full'));
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSheet((c) => (c === 'full' ? 'half' : 'peek'));
    }
  };

  // The readings panel only exists while there is something to show — the
  // map otherwise keeps the full window, and it closes itself again once the
  // last card is removed.
  const showPanel = isFetchingData || dataList.length > 0;

  // New data arriving behind a collapsed sheet would be invisible; lift it.
  const latestId = dataList[0]?.id;
  useEffect(() => {
    if (!latestId) return;
    setSheet((current) => (current === 'peek' ? 'half' : current));
  }, [latestId]);

  return (
    <div className="app-shell">
      <StationMap stations={stations} onStationSelect={setSelectedStation} />

      <Header onSearch={setStations} resultCount={stations.length} />

      {showPanel && (
        <aside
          className="readings-panel"
          aria-label="Tracked readings"
          ref={panelRef}
          data-sheet={sheet}
        >
          <button
            type="button"
            className="sheet-handle"
            aria-label={`Resize readings panel (currently ${sheet})`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={handleKeyDown}
          >
            <span className="sheet-handle__bar" aria-hidden="true" />
          </button>

          <div className="readings-panel__head">
            <h2 className="readings-panel__title">
              <FiTrendingUp aria-hidden="true" />
              Readings
            </h2>
            {isFetchingData ? (
              <p className="loading-banner">
                <span className="spinner" aria-hidden="true" />
                Fetching…
              </p>
            ) : (
              <p className="hint-text">
                {dataList.length} spot{dataList.length === 1 ? '' : 's'}
              </p>
            )}
          </div>

          <div className="readings-panel__body">
            <div className="readings">
              {isFetchingData && <SkeletonReading />}

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
          </div>
        </aside>
      )}
    </div>
  );
}

export default App;
