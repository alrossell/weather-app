// pages/api/user/[userId].ts

import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { GetStaticProps } from 'next';
import { parse } from 'csv-parse';

import { CityInfo } from '../../app/types';

const maxDifference = 5;

const filePath = "./public/uscites.csv";
let table: number[][];

function CitySuggestion(first: string, second: string): number {

  first = first.toLowerCase();
  second = second.toLowerCase();

  function calc(row: number, col: number): number {
    const insertion = col >= 1 ? table[row][col - 1] + 1 : Number.MAX_SAFE_INTEGER;
    const deletion = row >= 1 ? table[row - 1][col] + 1 : Number.MAX_SAFE_INTEGER;

    let replacement = table[row - 1][col - 1] + ((first[row] != second[col]) ? 1 : 0);

    let transposition = Number.MAX_SAFE_INTEGER;
    if (row >= 2 && col >= 2 && first[row] == second[col - 1] && first[row - 1] == second[col]) {
      transposition = table[row - 2][col - 2] + 1;
    }

    const result = Math.min(insertion, deletion, replacement, transposition);

    return result;
  }

  if (Math.abs(first.length - second.length) > maxDifference) {
    return Number.MAX_SAFE_INTEGER;
  }

  first = "0" + first;
  second = "0" + second;

  table.forEach((row) => {
    row.fill(0);
  })

  for (let i = 0; i < first.length; i++) {
    table[i][0] = i;
  }

  for (let i = 0; i < second.length; i++) {
    table[0][i] = i;
  }

  for (let row = 1; row < first.length; row++) {
    for (let col = 1; col < second.length; col++) {
      table[row][col] = calc(row, col);
    }
  }

  return table[first.length - 1][second.length - 1];
}

function ArrayToCityInto(input: string[], similarValue: number): CityInfo {
  const newCityInfo: CityInfo = {
    city: input[0],
    city_ascii: input[1],
    state_id: input[2],
    state_name: input[3],
    county_name: input[4],
    lat: parseFloat(input[5]),
    lng: parseFloat(input[6]),
    ranking: parseInt(input[7]),
    id: parseInt(input[8]),
    similar_value: similarValue,
  };
  return newCityInfo;
};

function SortMostSimiliarCities(cityInfo: CityInfo[]): CityInfo[] {
  function CompareSimiliarValues(a: CityInfo, b: CityInfo): number {
    return a.similar_value - b.similar_value;
  }

  function CompareRankingValues(a: CityInfo, b: CityInfo): number {
    return a.ranking + b.ranking;
  }

  return cityInfo.sort(CompareSimiliarValues).slice(0, 5).sort(CompareRankingValues);
}

async function FindMostSimiliarCities(message: string): Promise<CityInfo[]> {

  let similarCityNames: CityInfo[] = [];
  const maxCityNameLength = 48;
  table = Array.from({ length: message.length + 1 }, () => Array(maxCityNameLength).fill(0));

  return new Promise(resolve => {
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on('data', function (row) {
        const similarValue = CitySuggestion(message, row[1]);
        if (similarValue <= 3) {
          similarCityNames.push(ArrayToCityInto(row, similarValue));
        }
      })
      .on('end', function () {
        resolve(similarCityNames);
      })
  });
}

export default function handler(req: NextApiRequest, res: NextApiResponse<CityInfo[] | { error: string }>) {

  const {
    query: { prompt },
  } = req;

  FindMostSimiliarCities(prompt as string).then((value) => {
    res.status(200).json(value);
  }, (error) => {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  })
};

