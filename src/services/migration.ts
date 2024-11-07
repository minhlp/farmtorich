import { ACCOUNT_TELEGRAM_CSV_PATH } from '~/constants'
import { readCSVFile } from '~/utils/readCSVFile'

class MigrationService {
  async migrateAccountFromCSVtoDB() {
    const csvData = await readCSVFile(ACCOUNT_TELEGRAM_CSV_PATH)
    console.log('CSV data as array:', csvData)
  }
}
export const Migration = new MigrationService()
