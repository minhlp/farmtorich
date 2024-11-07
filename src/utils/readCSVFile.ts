import * as fs from 'fs'
import csv = require('csv-parser')
import { ICSVAccountData } from '~/interfaces'

export function readCSVFile(filePath: string): Promise<ICSVAccountData[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = []

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data)) // Push each row to the results array
      .on('end', () => resolve(results)) // Resolve the promise with results on end
      .on('error', (error) => reject(error)) // Reject the promise on error
  })
}
