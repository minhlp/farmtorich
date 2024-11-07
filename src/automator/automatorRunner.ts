import { DB, log, Proxy, TgBotManager } from '~/services'
import { getBrowserContext } from '~/utils/browser'
import { getScreenResolutions } from '~/utils'
export function splitPositions(
  screens: { width: number; height: number }[],
  numWindows: number,
): {
  windowPositionX?: number
  windowPositionY?: number
  windowWidth?: number
  windowHeight?: number
}[] {
  // const totalWidth = screens.reduce((sum, screen) => {
  //   sum += screen.width
  //   return sum
  // }, 0)
  const totalWidth = screens[0].width
  const height = screens[0].height
  const numCols = Math.ceil(Math.sqrt(numWindows))
  const numRows = Math.ceil(numWindows / numCols)

  // Tính kích thước của mỗi cửa sổ
  const windowWidth = Math.floor(totalWidth / numCols)
  const windowHeight = Math.floor(height / numRows)

  const browserPromises = []

  // Tính toán vị trí cho các cửa sổ dựa trên số lượng đầu vào
  for (let i = 0; i < numWindows; i++) {
    const col = i % numCols
    const row = Math.floor(i / numCols)
    const x = col * windowWidth
    const y = row * windowHeight
    browserPromises.push({ windowPositionX: x, windowPositionY: y, windowWidth, windowHeight })
  }
  return browserPromises
}
export const runAutomator = async () => {
  const accounts = DB.getAll()
  const screens = await getScreenResolutions()
  const positions = splitPositions(screens, accounts.length)
  const bots = accounts.map(async (account, index) => {
    try {
      const proxyString = account.proxyString
      let proxy
      if (proxyString) {
        const proxyParsed = Proxy.parse(proxyString)
        proxy = {
          server: proxyParsed.server,
          username: proxyParsed.login,
          password: proxyParsed.password,
        }
      }
      // log.info(
      //   `position -> ${positions[index].windowPositionX} : ${positions[index].windowPositionY}`,
      // )
      const context = await getBrowserContext({
        headers: account.agent,
        argInputs: positions[index],
        proxy,
      })

      const { state } = account
      if (state.cookies) {
        await context.addCookies(state.cookies)
      }
      // Step 2: Open a new page and go to X.com login page
      const page = await context.newPage()
      // Mở trang tạm thời để thiết lập localStorage
      // Truy cập vào trang Telegram để thiết lập localStorage
      await page.goto('https://web.telegram.org')

      // Thiết lập localStorage trên trang này
      if (state.origins && state.origins[0] && state.origins[0].localStorage) {
        for (const { name, value } of state.origins[0].localStorage) {
          await page.evaluate(
            // eslint-disable-next-line @typescript-eslint/no-loop-func
            ([key, val]) => {
              localStorage.setItem(key, val)
            },
            [name, value],
          )
        }
      }

      // Điều hướng đến trang đích sau khi thiết lập xong localStorage
      // await page.goto('https://t.me/PAWSOG_bot/PAWS?startapp=NUUAX3p8', {
      //   waitUntil: 'domcontentloaded',
      // })

      log.info('Logged in with session state from object!')
      const page2 = await context.newPage()
      await page2.goto(TgBotManager.PAWS, {
        waitUntil: 'domcontentloaded',
      })
      await page2.waitForLoadState('networkidle') // Wait for all network requests to finish
      // // Lắng nghe sự kiện dialog để tự động đóng nếu xuất hiện
      log.info(`network requests finished`)
      // Wait until the href attribute of .tgme_action_web_button has a value
      await page2.waitForFunction(() => {
        const button = document.querySelector('.tgme_action_web_button') as HTMLAnchorElement
        return button && button.href // Wait until the button exists and href is not empty
      })
      const url = await page2.evaluate(() => {
        const button = document.querySelector('.tgme_action_web_button') as HTMLAnchorElement
        return button ? button.href : null
      })

      log.success('Extracted tgData')
      if (url) {
        await page2.goto(url, {
          waitUntil: 'domcontentloaded',
        })
        await page2.waitForLoadState('networkidle') // Wait for all network requests to finish
        // Check if a modal dialog appears and click "Confirm" if it does
        // const html = await page2.content()
        // fs.writeFileSync('pageContent.html', html)
        try {
          // Wait for the modal to appear
          const modalSelector = '.has-open-dialog' // Adjust based on actual class or selector
          await page2.waitForSelector(modalSelector, { timeout: 5000 }) // 5s

          log.info('Modal dialog is open.')

          // Click the Confirm button inside the modal
          const confirmButtonSelector = 'button:has-text("Confirm")' // Adjust if needed
          await page2.click(confirmButtonSelector)
          log.success('PAWS is connected')
        } catch (error) {
          // log.error(
          //   'No modal dialog found or Confirm button is not present' + String(error),
          //   account.name,
          // )
          try {
            // First load dapp
            const modalSelector = '.popup.popup-confirmation.active' // Adjust based on actual class or selector
            await page2.waitForSelector(modalSelector, { timeout: 30000 }) // 30s
            log.info('Modal dialog is open. First load dapp')
            // Click the Confirm button inside the modal
            const confirmButtonSelector = 'button:has-text("Launch")' // Adjust if needed
            await page2.click(confirmButtonSelector)
            log.success('PAWS is connected')
          } catch (err) {
            log.error(
              'No modal dialog found or Launch button is not present' + String(err),
              account.name,
            )
            await page2.goto('https://web.telegram.org/k/#@PAWSOG_bot')
            await page2.waitForLoadState('networkidle')
            const openCmdButtonSelector = '.new-message-bot-commands-view:has-text("Open")' // Adjust if needed
            await page2.click(openCmdButtonSelector)
            log.success('PAWS is connected with owner')
          }
        }
      }
    } catch (error) {
      log.error(String(error), account.name)
    }
  })

  await Promise.all(bots)
}
