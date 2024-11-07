import { Browser, BrowserContext, BrowserContextOptions, chromium, devices } from 'playwright-core'
import { findChrome } from './find-chrome'
import { IRequestHeader } from '~/interfaces'

let browser: Browser | undefined
let context: BrowserContext | undefined

export const getBrowserContext = async ({
  chromiumPath,
  storageState,
  headers,
  argInputs,
  proxy,
}: {
  chromiumPath?: string
  profilePath?: string
  storageState?: string
  headers?: IRequestHeader
  argInputs?: {
    windowPositionX?: number
    windowPositionY?: number
    windowWidth?: number
    windowHeight?: number
  }
  proxy?: {
    server: string
    username?: string
    password?: string
  }
} = {}) => {
  if (context) return context

  const args: string[] = ['--no-sandbox']
  let viewport: { width: number; height: number } | null = null
  if (argInputs) {
    if (
      typeof argInputs.windowPositionX === 'number' &&
      typeof argInputs.windowPositionY === 'number'
    ) {
      args.push(`--window-position=${argInputs.windowPositionX},${argInputs.windowPositionY}`)
    }
    if (typeof argInputs.windowWidth === 'number' && typeof argInputs.windowHeight === 'number') {
      args.push(`--window-size=${argInputs.windowWidth},${argInputs.windowHeight}`)
      viewport = { width: argInputs.windowWidth, height: argInputs.windowHeight }
    }
  }
  console.log(args)
  browser = await chromium.launch({
    args,
    executablePath: chromiumPath || findChrome(),
    headless: false,
    slowMo: 100,
    proxy,
  })
  let options: BrowserContextOptions = {}
  if (!headers) {
    options = {
      ...devices['iPhone 12'],
      storageState,
    }
  } else {
    options = {
      userAgent: headers['User-Agent'],
      extraHTTPHeaders: {
        'Sec-CH-UA': headers['Sec-Ch-Ua'],
        'Sec-CH-UA-Platform': headers['Sec-Ch-Ua-Platform'],
        'Sec-CH-UA-Mobile': headers['Sec-Ch-Ua-Mobile'],
      },
      isMobile: true,
      storageState,
    }
  }
  if (viewport) {
    options.viewport = viewport
  }
  context = await browser.newContext(options)
  return context
}

export const destroyBrowser = async () => {
  if (browser && context) {
    await context.close()
    await browser.close()
    browser = undefined
    context = undefined
  }
}
