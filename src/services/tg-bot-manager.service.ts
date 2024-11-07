import { TELEGRAM_BOTS_PATH } from '~/constants'
import fs from 'fs'
import { ITgBotManager } from '~/interfaces'
import { log } from './logger'

class TgBotManagerService implements ITgBotManager {
  PAWS = 'https://t.me/PAWSOG_bot/PAWS?startapp=NUUAX3p8'
  private _write(data: ITgBotManager) {
    fs.writeFileSync(TELEGRAM_BOTS_PATH, JSON.stringify(data, null, 2), 'utf8')
  }

  init() {
    const isDBCreated = fs.existsSync(TELEGRAM_BOTS_PATH)
    if (!isDBCreated) {
      this._write(this.toObject())
      log.success('Database has been successfully initialized')
    }
    this.load()
  }
  toObject(): ITgBotManager {
    return { ...this }
  }
  load() {
    const jsonData = fs.readFileSync(TELEGRAM_BOTS_PATH, 'utf8')
    const obj = JSON.parse(jsonData) as ITgBotManager
    Object.assign(this, obj)
  }
}
export const TgBotManager = new TgBotManagerService()
