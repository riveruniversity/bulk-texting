// Save log
import path from "path";
const fs = require("fs");

import { Attendee, DayTime } from "../Types";


export function fixNumber(num: string | null, { addDashes } = { addDashes: true }) {

  if (!num) return ''

  const cleaned = String(num).trim()
    .replace(/(?<!^)\+|[^\d+]+/g, '')  // Remove non digits and keep the +
    .replace(/^00/, '+')               // Remove preceding '00'
    .replace(/^\+?1(?=\d{10})/, '')    // Remove preceding '+1' or '1' for American numbers     


  if (cleaned.length == 10) {
    if (addDashes)
      return cleaned.replace(/^(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
    else
      return cleaned
  }
  else if (cleaned.includes('+')) {
    return ''
  }
  else {
    return ''
  }
}


export function getDateTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = ("0" + (now.getMonth() + 1)).slice(-2);
    const day = ("0" + now.getDate()).slice(-2);

    const hour = ("0" + now.getHours()).slice(-2);
    const minute = ("0" + now.getMinutes()).slice(-2);
    const second = ("0" + now.getSeconds()).slice(-2);

    // YYYY-MM-DD hh:mm:ss
    const formatted = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

    return formatted;
}


export function getTimestamp(stringTime: string | undefined) {

    if (!stringTime) return ''.toString();

    const dateTime = new Date(stringTime);
    const timestamp = dateTime.getTime() / 1000;
    return timestamp.toString();
}


export interface Log {
    location: string;
    status: 'Error' | 'Success' | 'Curl Error' | 'Log' | 'Failure';
    message: string;
    phone?: string;
    params?: object;
    id?: any;
}

export async function logStatus(log: Log) {

    try {
        //_console.log("🗒️  logging " + log.location);



        const msg = `${getDateTime()} | ${log.status}: ${log.id ? log.id : ''} | ${log.phone ? log.phone + ' | ' : ''}${log.message} \n`;

        const file = path.resolve(process.cwd(), 'logs', `${log.location}.log`);
        fs.writeFileSync(file, msg, { flag: 'a+' }); //r w+
    }
    catch (error) {
        console.error(error)
    }
}


export function sleep(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};



export function showPercent(i: string, arr: Attendee[]): void 
{
    const percent: string = ((+i + 1) / arr.length * 100).toFixed(1)
    console.log('🔔', `${+i + 1} (${percent}%)`, arr[+i].barcode);
}


export function getDayTime(timestamp?: string ): DayTime {
  const date: Date = timestamp ?  new Date(timestamp) : new Date();
  const hours = date.getHours();

  const dayTime = hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening';
  return dayTime;
}


export const color = {
  'black': 30,
  'red': 31,
  'green': 32,
  'yellow': 33,
  'dark blue': 34,
  'purple': 35,
  'turquoise': 36,
  'white': 37
}

export function log(location: string, msg: any, color1: number = color.turquoise, textColor: number = color.white) {

  console.info(`\x1b[${color1}m[%s] \x1b[${textColor}m%s\x1b[0m`, location, msg);
}