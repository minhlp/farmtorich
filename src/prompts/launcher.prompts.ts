import inquirer, { QuestionCollection } from 'inquirer'
import { LAUNCH_MODE_ENUM, LAUNCH_TELEGRAM_MODE_ENUM } from '~/enums'
export const launchPrompt = async (): Promise<LAUNCH_MODE_ENUM> => {
  const questions: QuestionCollection = [
    {
      type: 'list',
      name: 'action',
      message: 'Select an action',
      choices: [
        { key: 1, name: 'Telegram Mini App', value: LAUNCH_MODE_ENUM.telegram_mini_app },
        { key: 2, name: 'Check Proxy', value: LAUNCH_MODE_ENUM.test_proxy },
        { key: 3, name: 'Check Browser', value: LAUNCH_MODE_ENUM.test_browser },
      ],
    },
  ]

  const { action } = await inquirer.prompt(questions)
  return action
}
export const launchTelegramMiniAppPrompt = async (): Promise<LAUNCH_TELEGRAM_MODE_ENUM> => {
  const questions: QuestionCollection = [
    {
      type: 'list',
      name: 'action',
      message: 'Select an action',
      choices: [
        {
          key: 1,
          name: 'Run automator',
          value: LAUNCH_TELEGRAM_MODE_ENUM.run_automator,
        },
        { key: 2, name: 'Add new account', value: LAUNCH_TELEGRAM_MODE_ENUM.add_account },

        // {
        //   key: 3,
        //   name: 'Import accounts from csv',
        //   value: LAUNCH_TELEGRAM_MODE_ENUM.import_account_from_csv,
        // },
      ],
    },
  ]

  const { action } = await inquirer.prompt(questions)
  return action
}
