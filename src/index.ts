import { Account, DB, log, TgBotManager } from '~/services'
import { AUTHOR } from '~/constants'
import { runAutomator } from '~/automator'
import { LAUNCH_MODE_ENUM, LAUNCH_TELEGRAM_MODE_ENUM } from '~/enums'
import { launchPrompt, launchTelegramMiniAppPrompt } from '~/prompts'
import { BROWSER } from './services/browser'
import { Proxy } from './services/proxy'
// import { Migration } from './services/migration'
const telegramLauncher = async () => {
  const action = await launchTelegramMiniAppPrompt()
  const { add_account, run_automator } = LAUNCH_TELEGRAM_MODE_ENUM
  switch (action) {
    case add_account:
      await Account.add()
      break
    // case import_account_from_csv:
    //   await Migration.migrateAccountFromCSVtoDB()
    //   break
    case run_automator:
      await runAutomator()
      break
  }
}
const launcher = async () => {
  const action = await launchPrompt()
  const { telegram_mini_app, test_proxy, test_browser } = LAUNCH_MODE_ENUM

  switch (action) {
    case telegram_mini_app:
      await telegramLauncher()
      break
    case test_proxy:
      await Proxy.test()
      break
    case test_browser:
      await BROWSER.test()
      break
  }
}

try {
  DB.init()
  TgBotManager.init()
  log.info(AUTHOR)

  if (process.argv[2] === '--automator') runAutomator()
  else launcher()
} catch (e) {
  log.error(String(e))
}
