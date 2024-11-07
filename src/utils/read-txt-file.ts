import * as fs from 'fs'
import * as readline from 'readline'
export type ReadTxtFileFn<T> = (line: string) => T
export async function readTxtFile<T>(filePath: string, convertFn: ReadTxtFileFn<T>): Promise<T[]>
export async function readTxtFile(filePath: string): Promise<string[]>
export async function readTxtFile(
  filePath: string,
  convertFn?: ReadTxtFileFn<unknown>,
): Promise<unknown[]> {
  const readStream = fs.createReadStream(filePath, { encoding: 'utf8' })

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  })

  const lines = []

  for await (const line of rl) {
    lines.push(convertFn ? convertFn(line) : line)
  }

  return lines // Return array of strings, where each string is a line from the file
}
