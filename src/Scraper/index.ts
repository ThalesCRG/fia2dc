import { parse } from "node-html-parser";
import fs from "fs/promises";
import { EventEmitter } from "stream";
import path from "path";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { Logger, LogTypes } from "../Logger";
import axios from "axios";

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
    try {
      var startTime = process.hrtime();

      const response = await axios.get("https://www.fia.com/documents/");

      const stringdata = response.data as string;

      const parsed = parse(stringdata);

      const links = parsed.querySelectorAll("a");

      const linkCollection = links
        .filter((link) => link.rawAttributes.href.endsWith(".pdf"))
        .map(
          (link) => "https://www.fia.com" + encodeURI(link.rawAttributes.href)
        );

      const existingFiles = (await fs.readFile(LINK_FILE, "utf-8")).split("\n");

      for (const link of linkCollection) {
        if (!existingFiles.find((file) => file === link)) {
          await fs.appendFile(LINK_FILE, link + "\n");
          this.emit(EVENT_TYPES.NEW_PDF_LINK, link);
        }
      }
      var elapsedSeconds = process.hrtime(startTime);
      logger.log(
        LogTypes.SCRAPING_ON,
        url +
          ", took: " +
          `${
            Math.round(
              (elapsedSeconds[0] + elapsedSeconds[1] / 1000000000) * 100
            ) / 100
          }` +
          "s"
      );
    } catch (error) {
      logger.log(LogTypes.ERROR_SCRAPING, error);
    }
  }
}
