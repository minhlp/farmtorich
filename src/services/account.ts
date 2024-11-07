import { AccountModel, IRequestHeader } from '~/interfaces'
import { IBrowserState } from '~/interfaces/browser.interface'
import { accountActionPrompt, accountNamePrompt, proxyPrompt } from '~/prompts'
import { generateUA } from '~/utils'
import { getBrowserContext } from '~/utils/browser'
import { DB } from './db'
import { log } from './logger'
import { Proxy } from './proxy'

class AccountManager {
  private async getProxyString(id: string): Promise<string> {
    const proxyString = await proxyPrompt()
    if (proxyString === '') return proxyString

    const isValid = Proxy.isValid(proxyString)

    if (!isValid) {
      log.error('Invalid proxy format, try again')
      return this.getProxyString(id)
    }
    await Proxy.check(proxyString, id)

    return proxyString
  }

  private async _createName(): Promise<string> {
    const name = await accountNamePrompt()
    const isAccountExisted = this.isExists(name)

    if (isAccountExisted) {
      const action = await accountActionPrompt(name)
      if (action === 'new') return this._createName()
      DB.delete(name)
      log.info(`${name} account has been deleted`)
    }

    return name
  }

  private async save(
    state: IBrowserState,
    agent: IRequestHeader,
    proxyString: string | null,
    name: string,
  ): Promise<void> {
    const account: AccountModel = {
      name,
      state,
      session: null,
      proxyString,
      agent,
      fingerprint: null,
      webData: null,
    }

    DB.set(account)
    log.success(`${name} account has been successfully saved`)
  }

  private isExists(name: string) {
    const clients = DB.getAll()
    return clients.some((client) => client.name === name)
  }

  async add(): Promise<void> {
    const name = await this._createName()
    const proxyString = await this.getProxyString(name)
    const agent = generateUA()
    let proxy
    if (proxyString) {
      const proxyParsed = Proxy.parse(proxyString)
      proxy = {
        server: proxyParsed.server,
        username: proxyParsed.login,
        password: proxyParsed.password,
      }
    }
    try {
      // Raw file content simulation
      const context = await getBrowserContext({
        headers: agent,
        proxy,
      })
      // Step 2: Open a new page and go to X.com login page
      const page = await context.newPage()
      await page.goto('https://web.telegram.org') // X.com login URL
      await page.waitForLoadState('networkidle') // Wait for all network requests to finish
      log.info(`network requests finished`)

      // // Inject a button into the page to close the browser
      // async function addSaveButton() {
      //   await page.evaluate(() => {
      //     const button = document.createElement('button')
      //     button.id = 'saveSessionButton'
      //     button.innerText = 'Close Browser'
      //     button.id = 'closeBrowserButton'
      //     button.style.position = 'fixed'
      //     button.style.bottom = '20px'
      //     button.style.right = '20px'
      //     button.style.padding = '10px'
      //     button.style.backgroundColor = '#f00'
      //     button.style.color = '#fff'
      //     button.style.border = 'none'
      //     button.style.cursor = 'pointer'
      //     document.body.appendChild(button)

      //     // Add an event listener to the button that dispatches a custom event
      //     button.addEventListener('click', () => {
      //       // window.dispatchEvent(new Event('closeBrowser'))
      //       ;(window as any).closeBrowser()
      //     })
      //   })
      // }

      // await addSaveButton()

      const chatListSelector = '#chatlist-container'

      // Thiết lập thời gian chờ tối đa là 5 phút
      const maxWaitTime = 5 * 60 * 1000 // 5 phút = 300,000 ms
      const startTime = Date.now()
      let isLoggedIn = false
      // Vòng lặp kiểm tra trạng thái đăng nhập
      while (Date.now() - startTime < maxWaitTime) {
        console.log('Waiting start time...', startTime)
        try {
          // Kiểm tra xem phần tử giao diện chính đã xuất hiện chưa
          await page.waitForSelector(chatListSelector, { timeout: 5000 }) // Thử mỗi 5 giây
          console.log('User logged in successfully!')

          // Lưu lại trạng thái đăng nhập mới
          const state = await context.storageState()
          // clearInterval(checkButtonInterval)
          await this.save(state, agent, proxyString, name)
          isLoggedIn = true
          break // Thoát vòng lặp nếu đăng nhập thành công
        } catch (error) {
          // Nếu không thấy phần tử, tiếp tục đợi
          console.log('Waiting for user to log in...', error)
        }
      }

      if (!isLoggedIn) {
        console.log('User did not log in within 5 minutes.')
      }

      await context.close()
    } catch (e) {
      log.error(String(e))
    } finally {
      // process.exit(0)
    }
  }
}

export const Account = new AccountManager()
