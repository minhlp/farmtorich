import * as fs from 'fs'

export function readJsonFile<T>(filePath: string): Promise<T> {
  return new Promise((resolve, reject) => {
    let data = ''

    fs.createReadStream(filePath, { encoding: 'utf8' })
      .on('data', (chunk) => {
        data += chunk
      })
      .on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      })
      .on('error', (error) => {
        reject(error)
      })
  })
}
