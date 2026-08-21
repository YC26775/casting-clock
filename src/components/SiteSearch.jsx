import { useState } from 'react';
import axios from 'axios';
import { FiAlertCircle, FiSearch } from 'react-icons/fi';

function SiteSearch({ onSearch, resultCount = 0 }) {
  const stateCodes = {
    alabama: 'AL',
    alaska: 'AK',
    arizona: 'AZ',
    arkansas: 'AR',
    california: 'CA',
    colorado: 'CO',
    connecticut: 'CT',
    delaware: 'DE',
    florida: 'FL',
    georgia: 'GA',
    hawaii: 'HI',
    idaho: 'ID',
    illinois: 'IL',
    indiana: 'IN',
    iowa: 'IA',
    kansas: 'KS',
    kentucky: 'KY',
    louisiana: 'LA',
    maine: 'ME',
    maryland: 'MD',
    massachusetts: 'MA',
    michigan: 'MI',
    minnesota: 'MN',
    mississippi: 'MS',
    missouri: 'MO',
    montana: 'MT',
    nebraska: 'NE',
    nevada: 'NV',
    'new hampshire': 'NH',
    'new jersey': 'NJ',
    'new mexico': 'NM',
    'new york': 'NY',
    'north carolina': 'NC',
    'north dakota': 'ND',
    ohio: 'OH',
    oklahoma: 'OK',
    oregon: 'OR',
    pennsylvania: 'PA',
    'rhode island': 'RI',
    'south carolina': 'SC',
    'south dakota': 'SD',
    tennessee: 'TN',
    texas: 'TX',
    utah: 'UT',
    vermont: 'VT',
    virginia: 'VA',
    washington: 'WA',
    'west virginia': 'WV',
    wisconsin: 'WI',
    wyoming: 'WY',
  };
  const STATE_STATIONS_API =
    'https://waterservices.usgs.gov/nwis/site/?siteType=ST&hasDataTypeCd=iv&siteOutput=expanded';

  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState('');
  const [error, setError] = useState('');
  const handleChange = (event) => {
    setState(event.target.value);
    setError('');
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const searchText = state.toLocaleLowerCase().trim();
    if (!state || stateCodes[searchText] === undefined) {
      setError('Invalid input! Unknown state.');
      return;
    }
    try {
      console.log(`state code ${stateCodes[searchText]}`);
      const stationResult = await fetchStation(stateCodes[searchText]);
      onSearch(stationResult ?? []);
    } catch (error) {
      console.log(`Error:${error}`);
    }
  };
  const fetchStation = async (code) => {
    setIsLoading(true);
    try {
      const response = await axios.get(STATE_STATIONS_API, {
        params: {
          stateCd: code,
        },
      });
      return toStations(parseRDB(response.data));
    } catch (error) {
      console.error('fetchStation API Error:', error);
      setError('Error fetching station data');
    } finally {
      setIsLoading(false);
    }
  };
  /*
   * Every column stays a string here. Site numbers are zero-padded ids, not
   * quantities — running them through parseFloat turned '01334000' into
   * 1334000 and lost the leading zero, so anything that needed the real id
   * had to guess it back.
   */
  const parseRDB = (rdbText) => {
    const lines = rdbText.split('\n');
    const results = [];
    let headers = [];
    let skipNextLine = false;

    for (const line of lines) {
      if (line.startsWith('#') || line.trim() === '') {
        continue;
      }
      const parts = line.split('\t');
      if (headers.length === 0) {
        headers = parts.map((part) => part.trim());
        // The row after the header holds column widths, not data.
        skipNextLine = true;
        continue;
      }
      if (skipNextLine) {
        skipNextLine = false;
        continue;
      }

      const row = {};
      headers.forEach((header, index) => {
        const value = parts[index]?.trim();
        row[header] = value === '' ? undefined : value;
      });
      results.push(row);
    }
    return results;
  };

  /*
   * Not every row USGS returns is mappable:
   *
   *  - A few carry no coordinates at all (Alaska's 15238950 is one). Leaflet
   *    throws on the first bad LatLng and takes the whole render down with it,
   *    so one empty row used to blank the page for the other 285 gauges.
   *  - A handful of transboundary gauges are filed under a US state_cd while
   *    country_cd says 'CA' — that is how Canadian gauges surfaced in searches
   *    for Alabama, Delaware and Alaska.
   *
   * Both get dropped here so nothing downstream has to defend against them.
   */
  const toStations = (rows) =>
    rows.reduce((stations, row) => {
      const lat = Number(row.dec_lat_va);
      const long = Number(row.dec_long_va);

      if (!row.site_no) return stations;
      if (!Number.isFinite(lat) || !Number.isFinite(long)) return stations;
      if (Math.abs(lat) > 90 || Math.abs(long) > 180) return stations;
      if (row.country_cd && row.country_cd !== 'US') return stations;

      stations.push({
        site_no: row.site_no,
        station_nm: row.station_nm ?? `Gauge ${row.site_no}`,
        dec_lat_va: lat,
        dec_long_va: long,
      });
      return stations;
    }, []);

  const titleCase = (name) =>
    name.replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <div className="search">
      <form
        className={`search__form${error ? ' search__form--error' : ''}`}
        onSubmit={handleSubmit}
      >
        <span className="search__icon" aria-hidden="true">
          <FiSearch />
        </span>
        <label className="sr-only" htmlFor="state-input">
          Search gauges by state
        </label>
        <input
          id="state-input"
          className="search__input"
          name="state"
          type="string"
          list="state-options"
          autoComplete="off"
          onChange={handleChange}
          value={state}
          placeholder="Search a state"
          aria-invalid={error ? 'true' : 'false'}
        />
        <datalist id="state-options">
          {Object.keys(stateCodes).map((name) => (
            <option key={name} value={titleCase(name)} />
          ))}
        </datalist>
        <button className="btn" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Searching
            </>
          ) : (
            'Find gauges'
          )}
        </button>
      </form>

      <div className="search__foot" role="status" aria-live="polite">
        {error ? (
          <p className="search__error">
            <FiAlertCircle aria-hidden="true" />
            {error}
          </p>
        ) : resultCount > 0 ? (
          <p className="search__hint">
            {resultCount.toLocaleString()} gauges on the map — pick a pin
          </p>
        ) : (
          <p className="search__hint">Try “Montana” or “Vermont”</p>
        )}
      </div>
    </div>
  );
}

export default SiteSearch;
