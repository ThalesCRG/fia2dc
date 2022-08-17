import { EVENT_TYPES as SCRAPER_EVENT_TYPES, Scraper } from "./Scraper";
import { Downloader, EVENT_TYPES } from "./Downloader";
import { DiscordWebhook } from "./Discord";
import { Logger } from "./Logger";
require("dotenv").config();

const logger = new Logger();

async function start() {
  const scraper = new Scraper();
  const downloader = new Downloader();
  const webhookClient = new DiscordWebhook(process.env.WEBHOOK_URI as string);

  setInterval(() => {
    scraper.scrapeSite(process.env.FIA_DOCS_URI as string);
  }, 10000);
  scraper.on(SCRAPER_EVENT_TYPES.NEW_PDF_LINK, async (link) => {
    await downloader.downloadFile(link);
  });

  downloader.on(EVENT_TYPES.SAVED_FILE, async (file) => {
    await webhookClient.releaseAFile(file);
  });
}

start();
