import qs from 'qs';
import fetch from 'node-fetch';
import moment from 'moment';

import PromiseQueue from './promise_queue';

const MAX_LAT = 180;
const MAX_LNG = 90;
const MAX_CONCURRENT_FETCHES = 5;
const TOTAL_FETCHES = 100;
const API_ENDPOINT = 'https://api.sunrise-sunset.org/json';

interface Coord {
  lat: string;
  lng: string;
}

interface SunriseResponse {
  results: {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    day_length: number;
    civil_twilight_begin: string;
    civil_twilight_end: string;
    nautical_twilight_begin: string;
    nautical_twilight_end: string;
    astronomical_twilight_begin: string;
    astronomical_twilight_end: string;
  };
  status: string;
}

function randCoord(max: number): string {
  return (Math.random() * max * 2 - max).toFixed(7);
}

function fetchCoordinateData(coord: Coord): Promise<Response> {
  const queryString = qs.stringify({
    ...coord,
    formatted: 0,
  });

  const fetchUrl = `${API_ENDPOINT}?${queryString}`;

  return fetch(fetchUrl)
    .then((res) => res.json())
    .catch(() => {
      // eslint-disable-next-line no-console
      console.log(`An error has occurred fetching ${fetchUrl}`);
    });
}

function findResultWithEarliestSunrise(responses: SunriseResponse[]): SunriseResponse['results'] {
  return responses
    .map((response) => response.results)
    .filter((result) => result.day_length !== 0)
    .sort((a, b) => (a.sunrise > b.sunrise ? 1 : -1))[0];
}

function formatDayLength(dayLength: number): string {
  return moment
    .unix(dayLength)
    .utc()
    .format('H [hours,] m [minutes,] s [seconds] ');
}

async function main(): Promise<void> {
  const queue = new PromiseQueue<SunriseResponse>(MAX_CONCURRENT_FETCHES);

  for (let i = 0; i < TOTAL_FETCHES; i += 1) {
    const coord = {
      lat: randCoord(MAX_LAT),
      lng: randCoord(MAX_LNG),
    };

    queue.addPromise(() => fetchCoordinateData(coord));
  }

  const responses: SunriseResponse[] = await queue.handleAll();
  const result = findResultWithEarliestSunrise(responses);
  const formattedDayLength = formatDayLength(result.day_length);

  // eslint-disable-next-line no-console
  console.log(formattedDayLength);
}

if (require.main === module) {
  main();
}
