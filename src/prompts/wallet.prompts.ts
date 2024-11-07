import inquirer, { QuestionCollection } from 'inquirer'
import { CHAIN_ENUM } from '~/enums'

export const walletActionPrompt = async (): Promise<{
  chainName: CHAIN_ENUM
  numberOfWallets: number
}> => {
  const questions: QuestionCollection = [
    {
      type: 'list',
      name: 'chainName',
      message: `Choose chain you want to generate wallet?`,
      choices: [{ key: 1, name: 'Etherium', value: CHAIN_ENUM.etherium }],
    },
    {
      type: 'number',
      name: 'numberOfWallets',
      message: 'The number of wallets generate?',
    },
  ]

  const { chainName, numberOfWallets } = await inquirer.prompt(questions)
  return { chainName, numberOfWallets }
}
