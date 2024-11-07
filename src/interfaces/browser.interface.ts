export interface IBrowserState {
  cookies: Array<{
    name: string

    value: string

    domain: string

    path: string

    /**
     * Unix time in seconds.
     */
    expires: number

    httpOnly: boolean

    secure: boolean

    sameSite: 'Strict' | 'Lax' | 'None'
  }>

  origins: Array<{
    origin: string

    localStorage: Array<{
      name: string

      value: string
    }>
  }>
}
