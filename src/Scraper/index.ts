import puppeteer from "puppeteer";
import fs from "fs/promises";
import { EventEmitter } from "stream";
import path from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { Logger, LogTypes } from "../Logger";

const logger = new Logger();

const WORKING_DIR = process.cwd();
const CONFIG_DIR = path.join(WORKING_DIR, "config");
const LINK_FILE = path.join(CONFIG_DIR, "pdfLinks.txt");

export enum EVENT_TYPES {
  NEW_PDF_LINK = "new_pdf_link",
}

export class Scraper extends EventEmitter {
  constructor() {
    super();
    this.createLinkFile();
    this.on(EVENT_TYPES.NEW_PDF_LINK, (link) => {
      logger.log(LogTypes.NEW_PDF_LINK, link);
    });
  }

  private createLinkFile() {
    if (existsSync(LINK_FILE)) return;
    try {
      logger.log(LogTypes.CREATE_CONFIG_DIR, CONFIG_DIR);
      if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR);
      logger.log(LogTypes.CREATE_LINK_FILE, LINK_FILE);
      if (!existsSync(LINK_FILE)) writeFileSync(LINK_FILE, "");
    } catch (error) {
      logger.log(LogTypes.ERROR_IN_CREATE_LINK_FILE, error);
    }
  }

  async scrapeSite(url: string) {
    logger.log(LogTypes.SCRAPING_ON, url);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);

    //this gives back an actual array, not a node list
    const linkCollection = await page.$$eval("a", (links) => {
      return links.map((link) => {
        return link.href;
      });
    });

    const existingFiles = (await fs.readFile(LINK_FILE, "utf-8")).split("\n");

    for (const link of linkCollection) {
      if (link.includes(".pdf")) {
        if (!existingFiles.find((file) => file === link)) {
          await fs.appendFile(LINK_FILE, link + "\n");
          this.emit(EVENT_TYPES.NEW_PDF_LINK, link);
        }
      }
    }

    await browser.close();
  }
}
