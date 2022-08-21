export enum LogTypes {
  CONVERT_FILE = "CONVERTING FILE",
  ERROR_IN_CONVERTING = "CONVERTING ERROR",
  DC_WEBHOOK_SEND = "WEBHOOK SEND",
  DC_WEBHOOK_ERROR = "ERROR WEBHOOK",
  READING_LINKS = "RADING LINKS",
  DOWNLOAD = "DOWNLOAD",
  ERROR_IN_DOWNLOAD = "ERROR DOWNLOAD",
  NEW_PDF_LINK = "NEW PDF LINK",
  CREATE_CONFIG_DIR = "CREATE CONFIG DIR",
  CREATE_LINK_FILE = "CREATE LINK FILE",
  ERROR_IN_CREATE_LINK_FILE = "ERROR CREATE LINK FILE",
  SCRAPING_ON = "SCRAPED",
  ERROR_SCRAPING = "ERROR SCRAPING"
}
export class Logger {
  log(param1: any, param2: any) {
    console.log(`${new Date().toLocaleString()}\t[${param1}]\t[${param2}]`);
  }
}
