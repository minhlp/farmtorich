import fs from 'fs'
import path from 'path'

const { CHROME_PATH } = process.env

const paths_os: (string | undefined)[] =
  process.platform === 'darwin'
    ? [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
      ]
    : process.platform === 'win32'
      ? [
          process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe',
          process.env.PROGRAMFILES + '/Google/Chrome/Application/chrome.exe',
          process.env['PROGRAMFILES(X86)'] + '/Google/Chrome/Application/chrome.exe',
          process.env.LOCALAPPDATA + '/Chromium/Application/chrome.exe',
          process.env.PROGRAMFILES + '/Chromium/Application/chrome.exe',
          process.env['PROGRAMFILES(X86)'] + '/Chromium/Application/chrome.exe',
        ]
      : [
          '/usr/bin/google-chrome-stable',
          '/usr/bin/google-chrome',
          '/usr/bin/chromium',
          '/usr/bin/chromium-browser',
          '/snap/bin/chromium',
        ]
export const chromeProfilePath = path.join(
  process.env.HOME || process.env.USERPROFILE || '',
  'Library',
  'Application Support',
  'Google',
  'Chrome',
)
// function getLocalChromiumPath(): string | undefined {
//   try {
//     // const { path } = require('chromium')
//     return require('chromium').path
//   } catch {}
// }

export function findChrome(): string {
  // const paths = [getLocalChromiumPath(), CHROME_PATH, ...paths_os]
  const paths = [CHROME_PATH, ...paths_os]

  for (const p of paths) {
    if (p && fs.existsSync(p)) {
      return p
    }
  }
  throw new Error(`Cannot find Chrome on your system`)
}
export function findChromeProfileFolderDicts(): string[] {
  const files = ['Default', 'Profile 2', 'Profile 3']
  // const profiles = files
  //   .map((item) => path.join(chromeProfilePath, item))
  //   .filter((filePath) => fs.statSync(filePath).isDirectory())
  // Read the profile folders from the Chrome profile path
  // const profiles = fs
  //   .readdirSync(chromeProfilePath)
  //   .filter((file) => fs.statSync(path.join(chromeProfilePath, file)).isDirectory())

  return files
}
export function getFullProfileDict(folderName: string): string {
  return path.join(chromeProfilePath, folderName)
}
