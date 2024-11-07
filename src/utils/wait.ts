export const wait = (seconds = 3) => {
  const ms = seconds * 1000
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
export async function waitUntil(fn: () => Promise<void>, maxWaitTime = 5 * 60 * 1000) {
  // Thiết lập thời gian chờ tối đa là 5 phút
  const startTime = Date.now()
  let isWaited = false
  // Vòng lặp kiểm tra trạng thái đăng nhập
  while (Date.now() - startTime < maxWaitTime) {
    console.log('Waiting start time...', startTime)
    try {
      // Kiểm tra xem phần tử giao diện chính đã xuất hiện chưa
      await fn()
      isWaited = true
      break // Thoát vòng lặp nếu đăng nhập thành công
    } catch (error) {
      // Nếu không thấy phần tử, tiếp tục đợi
      console.log('Waiting for user to active...', error)
    }
  }

  if (!isWaited) {
    console.log('Dont active within 5 minutes.')
  }
}
