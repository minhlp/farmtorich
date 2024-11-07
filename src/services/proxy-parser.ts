import { IProxyParsed } from '~/interfaces'
import { log } from './logger'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { HttpsProxyAgent } from 'https-proxy-agent'

abstract class ProxyParserBase {
  constructor(public regex: RegExp) {}
  isValid(proxyString: string) {
    return this.regex.test(proxyString)
  }
  abstract getAgent(proxyString: string): any
  abstract parse(proxyString: string): IProxyParsed
}

export class Sock5ProxyParser extends ProxyParserBase {
  constructor(
    public regex = /^(?<login>[\w-]+):(?<password>[\w-]+)@(?<host>[\w.-]+):(?<port>\d+)$/,
  ) {
    super(regex)
  }
  getAgent(proxyString: string) {
    const parsedProxy = this.parse(proxyString)
    const proxy = parsedProxy.agentProxy
    return new SocksProxyAgent(proxy)
  }
  parse(proxyString: string): IProxyParsed {
    const isValid = this.isValid(proxyString)

    if (!isValid) {
      log.error('Invalid proxy format', 'Sock5ProxyParser')
      process.exit(1)
    }

    const match = proxyString.trim().match(this.regex)
    const { host, port, login, password } = match?.groups as Record<string, string>
    const protocol = 'socks5'
    let agentProxy = `${protocol}://${host}:${port}`
    if (login && password) agentProxy += `:${login}:${password}@`
    agentProxy += `${host}:${port}`
    return {
      agentProxy,
      server: `${protocol}://${host}:${port}`,
      host,
      port: Number(port),
      ...(login && { login }),
      ...(password && { password }),
    }
  }
}
export class HttpProxyParser extends ProxyParserBase {
  constructor(
    public regex = /^(?<host>[\w.-]+):(?<port>\d+):(?<login>[\w-]+):(?<password>[\w-]+)$/,
  ) {
    super(regex)
  }
  getAgent(proxyString: string) {
    const parsedProxy = this.parse(proxyString)
    console.log(parsedProxy)
    const proxy = parsedProxy.agentProxy
    log.info(`proxy url: ${proxy}`)
    return new HttpsProxyAgent(proxy)
  }
  parse(proxyString: string): IProxyParsed {
    const isValid = this.isValid(proxyString)

    if (!isValid) {
      log.error('Invalid proxy format', 'HttpProxyParser')
      process.exit(1)
    }

    const match = proxyString.trim().match(this.regex)
    const { host, port, login, password } = match?.groups as Record<string, string>
    //${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}
    const protocol = 'http'
    let agentProxy = `${protocol}://`
    if (login && password) agentProxy += `${login}:${password}@`
    agentProxy += `${host}:${port}`
    return {
      agentProxy,
      server: `${protocol}://${host}:${port}`,
      host,
      port: Number(port),
      ...(login && { login }),
      ...(password && { password }),
    }
  }
}
