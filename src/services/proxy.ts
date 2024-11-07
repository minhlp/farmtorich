import { IpInfoModel, IProxyParsed } from '~/interfaces'
import { Axios } from './axios'
import { log } from './logger'
import { HttpProxyParser, Sock5ProxyParser } from './proxy-parser'
import { proxyPrompt } from '~/prompts'

class ProxyService {
  private ax: Axios
  private ipInfoUrl = 'https://ipinfo.io/json'
  // private regex = /^(?<login>[\w-]+):(?<password>[\w-]+)@(?<host>[\w.-]+):(?<port>\d+)$/
  // private regex1 = /^(?<host>[\w-]+):(?<port>[\w-]+):(?<login>[\w.-]+):(?<password>\d+)$/
  private proxyParsers = [new Sock5ProxyParser(), new HttpProxyParser()]
  constructor() {
    this.ax = new Axios()
  }

  getAgent(proxyString: string) {
    for (let index = 0; index < this.proxyParsers.length; index++) {
      const parser = this.proxyParsers[index]
      if (parser.isValid(proxyString)) {
        return parser.getAgent(proxyString)
      }
    }
    log.error('Invalid proxy format')
    process.exit(1)
  }

  isValid(proxyString: string) {
    return this.proxyParsers.some((parser) => parser.isValid(proxyString))
  }

  parse(proxyString: string) {
    for (let index = 0; index < this.proxyParsers.length; index++) {
      const parser = this.proxyParsers[index]
      if (parser.isValid(proxyString)) {
        return parser.parse(proxyString)
      }
    }
    log.error('Invalid proxy format')
    process.exit(1)
  }

  toStringAgent(proxy: IProxyParsed): string {
    return proxy.agentProxy
  }

  async check(proxyString: string, id?: string) {
    try {
      const httpsAgent = this.getAgent(proxyString)
      console.log('httpAgent', httpsAgent)
      const { ip, country, city, timezone } = await this.ax.get<IpInfoModel>(this.ipInfoUrl, {
        httpsAgent,
        httpAgent: httpsAgent,
      })
      const msg = [id, `proxy_info: ${ip} | ${country} | ${city} | ${timezone}`]
        .filter((str) => !!str)
        .join(' | ')
      log.info(`${msg}`)
    } catch (e) {
      throw new Error(`Error during connect to proxy ${proxyString} | error: ${String(e)}`)
    }
  }
  async test() {
    const proxyString = await proxyPrompt()
    if (proxyString) await this.check(proxyString)
  }
}

export const Proxy = new ProxyService()
