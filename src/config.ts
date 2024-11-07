import { getEnvVar } from '~/helpers'

const settings = {
  api_id: Number(getEnvVar('API_ID')),
  api_hash: getEnvVar('API_HASH'),
}

export const config = {
  settings,
}
