import { BillerParser, ParsedBill } from './types';
import { parseEnbridge } from './enbridge';
import { parseRogers } from './rogers';
import { parseBell } from './bell';
import { parseTorontoHydro } from './torontoHydro';
import { parseTelus } from './telus';

const BILLER_PARSERS: BillerParser[] = [
  parseEnbridge,
  parseRogers,
  parseBell,
  parseTorontoHydro,
  parseTelus,
];

export function tryBillerParsers(text: string): ParsedBill | null {
  for (const parser of BILLER_PARSERS) {
    const result = parser(text);
    if (result && result.confidence >= 0.65) {
      return result;
    }
  }
  return null;
}

export type { ParsedBill, BillerParser };
