import { useState, useEffect } from 'react';
import axios from 'axios';

function SiteSearch({ onSearch }) {
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
    'https://waterservices.usgs.gov/nwis/site/?siteType=ST&hasDataTypeCd=iv';

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
      onSearch(stationResult);
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
      return parseRDB(response.data);
    } catch (error) {
      console.error('fetchStation API Error:', error);
      setError('Error fetching station data');
    } finally {
      setIsLoading(false);
    }
  };
  const parseRDB = (rdbText) => {
    const lines = rdbText.split('\n');
    const results = [];
    let headers = [];
    let skipNextLine = false;

    for (const line of lines) {
      if (line.startsWith('#') || line.trim() === '') {
        continue;
      }
      const parts = line
        .split('\t')
        .map((part) => (part.trim() === '' ? undefined : part));
      if (headers.length === 0 && parts.length > 0) {
        headers = parts;
        skipNextLine = true;
        continue;
      }
      if (skipNextLine) {
        skipNextLine = false;
        continue;
      }
      if (parts.length > 0) {
        const obj = {};
        headers.forEach((header, index) => {
          let value = parts[index]?.trim();
          obj[header] = isNaN(value) ? value : parseFloat(value);
        });
        results.push(obj);
      } else {
      }
    }
    return results;
  };
  return (
    <div>
      <p>{error ? `Error: ${error}` : null}</p>
      <form onSubmit={handleSubmit}>
        <input
          name="state"
          type="string"
          onChange={handleChange}
          value={state}
          placeholder="Enter the state here"
        />
        <button type="submit">Search</button>
      </form>
    </div>
  );
}

export default SiteSearch;
