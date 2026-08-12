import { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/style.css';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import { FiMapPin } from 'react-icons/fi';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/*
 * A flat amber teardrop with a near-black outline. The dark stroke keeps it
 * readable on the pale USGS topo sheet, and the saturated fill keeps it
 * readable on the dark satellite imagery.
 */
const stationPin = L.divIcon({
  className: 'pin-marker',
  html: `<svg viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M13 1.7c-5.7 0-10.3 4.6-10.3 10.3 0 7.5 8.9 19.2 10.3 21 1.4-1.8 10.3-13.5 10.3-21 0-5.7-4.6-10.3-10.3-10.3Z"
        fill="#f5a524" stroke="#06181e" stroke-width="2.2" stroke-linejoin="round" />
      <circle cx="13" cy="11.9" r="3.9" fill="#fff" stroke="#06181e" stroke-width="1.6" />
    </svg>`,
  iconSize: [26, 34],
  iconAnchor: [13, 33],
  popupAnchor: [0, -30],
});

const BASEMAPS = {
  topo: {
    label: 'Topo',
    url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
  },
  imagery: {
    label: 'Imagery',
    url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}',
  },
};

/*
 * The map now lives in a fluid, absolutely-positioned container instead of a
 * fixed-height box, so its element can change size (window resize, the
 * readings panel opening as a mobile bottom sheet, a font swap nudging
 * layout) without the browser ever firing a plain 'resize' event. Leaflet
 * only repaints on that event, so without this it keeps rendering tiles for
 * whatever size it was born at. A ResizeObserver catches every case.
 */
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

function FitBounds({ stations }) {
  const map = useMap();

  useEffect(() => {
    if (!map || stations.length === 0) return;

    const bounds = L.latLngBounds(
      stations.map((station) => [station.dec_lat_va, station.dec_long_va])
    );

    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 7 });
  }, [map, stations]);

  return null;
}

function StationMap({ stations, onStationSelect }) {
  const [mapPosition] = useState([37.8, -96.9]);
  const [basemap, setBasemap] = useState('topo');

  return (
    <div className="map-canvas">
      <MapContainer
        center={mapPosition}
        zoom={4}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          key={basemap}
          url={BASEMAPS[basemap].url}
          attribution="Tiles &copy; <a href='https://www.usgs.gov/'>USGS</a> The National Map"
        />
        {/* Default zoom control lives top-left, right under the search box —
            move it out of the way. */}
        <ZoomControl position="bottomleft" />
        <MapResizeHandler />
        <FitBounds stations={stations} />
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          iconCreateFunction={(cluster) => {
            return L.divIcon({
              html: `<div class="custom-cluster">${cluster.getChildCount()}</div>`,
              className: 'marker-cluster',
              iconSize: L.point(40, 40),
            });
          }}
        >
          {stations.map((station) => (
            // No hover handler here on purpose — the popup should only ever
            // open on a deliberate click, not while the cursor passes by.
            <Marker
              key={station.site_no}
              position={[station.dec_lat_va, station.dec_long_va]}
              icon={stationPin}
            >
              <Popup>
                <div className="station-popup">
                  <div>
                    <p className="station-popup__name">{station.station_nm}</p>
                    <p className="station-popup__meta">
                      Gauge #{station.site_no}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--sm"
                    onClick={() => {
                      onStationSelect(station);
                      console.log('station is selected.');
                    }}
                  >
                    Fetch Data
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      <div className="map-controls">
        <div className="seg" role="group" aria-label="Basemap style">
          {Object.entries(BASEMAPS).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              className="seg__btn"
              aria-pressed={basemap === key}
              onClick={() => setBasemap(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {stations.length === 0 && (
        <div className="map-overlay">
          <div className="map-overlay__inner">
            <span className="map-overlay__icon">
              <FiMapPin />
            </span>
            <strong>Pick a state to begin</strong>
            <p>
              Search top-left, then click any pin and hit “Fetch Data” to pull
              its flow and weather.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default StationMap;
