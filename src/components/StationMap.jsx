import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/style.css';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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
  const [mapPosition, setMapPosition] = useState([37.8, -96.9]);

  return (
    <div className="map-container">
      <MapContainer
        center={mapPosition}
        zoom={4}
        style={{ height: '400px', width: '500px' }}
      >
        <TileLayer url="https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}" />
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
            <Marker
              key={station.site_no}
              position={[station.dec_lat_va, station.dec_long_va]}
              eventHandlers={{
                mouseover: (e) => e.target.openPopup(),
                click: (e) => {
                  e.target.openPopup();
                },
              }}
            >
              <Popup>
                <div className="station-popup">
                  <h4>Station Name: {station.station_nm}</h4>
                  <p>Station Number : {station.site_no}</p>
                  <button
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
    </div>
  );
}

export default StationMap;
