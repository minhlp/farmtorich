import si from 'systeminformation'
export async function getScreenResolutions() {
  try {
    const data = await si.graphics()
    // Trả về mảng độ phân giải của từng màn hình
    return data.displays.map((display) => ({
      width: display.resolutionX || 0,
      height: display.resolutionY || 0,
    }))
  } catch (error) {
    console.error(error)
    return []
  }
}
