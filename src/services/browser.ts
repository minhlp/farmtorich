import { proxyPrompt } from '~/prompts'
import { Proxy } from './proxy'
import { log } from './logger'
import { getBrowserContext } from '~/utils/browser'

class BrowserManager {
  private ipInfoUrl = 'https://ipinfo.io/json'
  private async getProxyString(): Promise<string> {
    const proxyString = await proxyPrompt()
    if (proxyString === '') return proxyString

    const isValid = Proxy.isValid(proxyString)

    if (!isValid) {
      log.error('Invalid proxy format, try again')
      return this.getProxyString()
    }

    return proxyString
  }
  async test() {
    const proxyString = await this.getProxyString()
    const proxyParsed = Proxy.parse(proxyString)
    const context = await getBrowserContext({
      proxy: {
        server: proxyParsed.server,
        username: proxyParsed.login,
        password: proxyParsed.password,
      },
    })
    // Step 2: Open a new page and go to X.com login page
    const page = await context.newPage()
    // Mở trang tạm thời để thiết lập localStorage
    // Truy cập vào trang Telegram để thiết lập localStorage
    await page.goto(this.ipInfoUrl)
  }
}
export const BROWSER = new BrowserManager()
