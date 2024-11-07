import { IBrowserState } from './browser.interface'

export interface IRequestHeader {
  'Sec-Ch-Ua-Mobile': string
  'Sec-Ch-Ua-Platform': string
  'Sec-Ch-Ua': string
  'User-Agent': string
}
export interface AccountModel {
  name: string
  state: IBrowserState
  session: string | null
  proxyString: string | null
  agent: IRequestHeader
  fingerprint: {
    visitorId: string
    components: {
      [key: string]: { value: unknown; duration: number } | { error: unknown; duration: number }
    }
  } | null
  webData: {
    stringData: string
    lastUpdateAt: number
  } | null
}



export interface IpInfoModel {
  ip: string
  city: string
  region: string
  country: string
  loc: string
  org: string
  postal: string
  timezone: string
}

export interface ErrorModel {
  error_code: string
  error_message: string
}

export interface ICSVAccountData {
  sockProxy?: string
  phone: string
  api_id: string
  api_hash: string
}
