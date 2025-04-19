import axios from 'axios';

export async function fetchData(sta, lat, long) {
  const station = `0${sta}`;
  const fetchCurrentStreamData = async () => {
    try {
      const API_URL_Current_Stream =
        'https://waterservices.usgs.gov/nwis/iv/?format=json&siteStatus=all&period=PT1H';
      const response = await axios.get(API_URL_Current_Stream, {
        params: {
          sites: station,
        },
      });
      const resultArray = currentStreamDataCalc(response.data);
      return resultArray;
    } catch (error) {
      console.error('fetchCurrentStreamData API Error:', error);
      throw new Error('Failed to fetch Current Stream data');
    }
  };
  const fetchSeasonalStreamData = async () => {
    try {
      const API_URL_Seasonal_Stream =
        'https://waterservices.usgs.gov/nwis/stat/?format=rdb&statReportType=monthly&statTypeCd=mean';
      const response = await axios.get(API_URL_Seasonal_Stream, {
        params: {
          sites: station,
        },
      });
      const parseData = parseRDB(response.data);
      const resultArray = seasonalStreamDataCalc(parseData);
      return resultArray;
    } catch (error) {
      console.error('fetchSeasonalStreamData API Error:', error);
      throw new Error('Failed to fetch Seasonal Stream data');
    }
  };
  const fetchWeatherData = async () => {
    const API_URL_Weather = 'https://api.open-meteo.com/v1/forecast?';
    const weatherParams =
      'temperature_2m,precipitation,weather_code,relative_humidity_2m,apparent_temperature,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m';
    try {
      const response = await axios.get(API_URL_Weather, {
        params: {
          latitude: lat,
          longitude: long,
          current: weatherParams,
          wind_speed_unit: 'mph',
          temperature_unit: 'fahrenheit',
          precipitation_unit: 'inch',
        },
      });
      return response.data;
    } catch (error) {
      console.error(' fetchWeatherData API Error:', error);
      throw new Error('Failed to fetch Weather data');
    }
  };
  function parseRDB(rdbText) {
    const lines = rdbText.split('\n');
    const results = [];
    let headers = [];
    let skipNextLine = false;

    for (const line of lines) {
      // Skip comment lines and empty lines
      if (line.startsWith('#') || line.trim() === '') {
        continue;
      }

      const parts = line
        .split('\t')
        .map((part) => (part.trim() === '' ? undefined : part));

      // Detect headers
      if (headers.length === 0 && parts.length > 0) {
        headers = parts;
        skipNextLine = true; // Next line is usually data type descriptors
        continue;
      }

      // Skip data type description line
      if (skipNextLine) {
        skipNextLine = false;
        continue;
      }

      // Process data rows
      if (parts.length > 0) {
        // Allow rows with fewer columns than headers
        const obj = {};
        headers.forEach((header, index) => {
          let value = parts[index]?.trim(); // Use optional chaining to handle missing columns
          obj[header] = isNaN(value) ? value : parseFloat(value);
        });
        results.push(obj);
      } else {
      }
    }

    // console.log('Final Parsed Results:', results); // Log final results
    return results;
  }

  function currentStreamDataCalc(object) {
    let past1HourFlowValueMean = '--';
    let past1HourHeightValueMean = '--';
    const flowSeries = object?.value?.timeSeries?.find(
      (ts) => ts.variable?.variableCode?.[0]?.value === '00060' // USGS parameter code for discharge
    );

    if (flowSeries?.values?.[0]?.value) {
      const flowValues = flowSeries.values[0].value
        .map((v) => Number(v.value))
        .filter((v) => !isNaN(v));
      past1HourFlowValueMean =
        flowValues.length > 0 ? calculateAverage(flowValues).toFixed(2) : '--';
    }

    const heightSeries = object?.value?.timeSeries?.find(
      (ts) => ts.variable?.variableCode?.[0]?.value === '00065' // USGS parameter code for gage height
    );
    if (heightSeries?.values?.[0]?.value) {
      const heightValues = heightSeries.values[0].value
        .map((v) => Number(v.value))
        .filter((v) => !isNaN(v));
      past1HourHeightValueMean =
        heightValues.length > 0
          ? calculateAverage(heightValues).toFixed(2)
          : '--';
    }

    return [past1HourFlowValueMean, past1HourHeightValueMean];
  }

  function seasonalStreamDataCalc(array) {
    const date = new Date();
    const currentMonth = date.getMonth() + 1;
    const currentYear = date.getFullYear();
    const currentSeason = getCurrentSeason(currentMonth);
    let monthPast5YearsFlowMean = '--';
    let monthPast5YearsHeightMean = '--';
    let seasonPast5YearsFlowMean = '--';
    let seasonPast5YearsHeightMean = '--';

    const flowFilterArrayByMonth = array.filter(
      (object) =>
        object.year_nu >= currentYear - 5 &&
        object.month_nu === currentMonth &&
        object.parameter_cd === 60
    );

    monthPast5YearsFlowMean =
      flowFilterArrayByMonth.length === 0
        ? '--'
        : calculateAverage(
            flowFilterArrayByMonth.map((obj) => obj.mean_va)
          ).toFixed(2);

    const flowFilterArrayBySeason = array.filter(
      (object) =>
        object.year_nu >= currentYear - 5 &&
        currentSeason.includes(object.month_nu) &&
        object.parameter_cd === 60
    );

    seasonPast5YearsFlowMean =
      flowFilterArrayBySeason.length === 0
        ? '--'
        : calculateAverage(
            flowFilterArrayBySeason.map((obj) => obj.mean_va)
          ).toFixed(2);

    const heightFilterArrayByMonth = array.filter(
      (object) =>
        object.year_nu >= currentYear - 5 &&
        object.month_nu === currentMonth &&
        object.parameter_cd === 65
    );

    monthPast5YearsHeightMean =
      heightFilterArrayByMonth.length === 0
        ? '--'
        : calculateAverage(
            heightFilterArrayByMonth.map((obj) => obj.mean_va)
          ).toFixed(2);

    const heightFilterArrayBySeason = array.filter(
      (object) =>
        object.year_nu >= currentYear - 5 &&
        currentSeason.includes(object.month_nu) &&
        object.parameter_cd === 65
    );

    seasonPast5YearsHeightMean =
      heightFilterArrayBySeason.length === 0
        ? '--'
        : calculateAverage(
            heightFilterArrayBySeason.map((obj) => obj.mean_va)
          ).toFixed(2);

    return [
      monthPast5YearsFlowMean,
      monthPast5YearsHeightMean,
      seasonPast5YearsFlowMean,
      seasonPast5YearsHeightMean,
    ];
  }

  function calculateAverage(arr) {
    const sum = arr.reduce((acc, num) => acc + num, 0);
    return sum / arr.length;
  }

  function getCurrentSeason(month) {
    return month >= 2 && month <= 4
      ? [2, 3, 4]
      : month >= 5 && month <= 7
      ? [5, 6, 7]
      : month >= 8 && month <= 10
      ? [8, 9, 10]
      : [11, 12, 1];
  }
  try {
    const currentStream = await fetchCurrentStreamData();
    const seasonalStream = await fetchSeasonalStreamData();
    const weather = await fetchWeatherData();
    return {
      currentStream,
      seasonalStream,
      weather,
    };
  } catch (error) {
    console.error('Error in fetching data:', error);
    return null;
  }
}
