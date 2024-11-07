import { walletActionPrompt } from '~/prompts/wallet.prompts'
import { log } from './logger'

class WalletManager {
  async add(): Promise<void> {
    const { chainName, numberOfWallets } = await walletActionPrompt()
    log.info('Start add new wallet: ' + chainName + numberOfWallets)
    process.exit(0)
  }
}
export const Wallet = new WalletManager()
