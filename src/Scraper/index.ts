import puppeteer from "puppeteer";
import fs from "fs/promises";

import { EventEmitter } from "stream";

export class Scraper extends EventEmitter {
  constructor() {
    super();
    this.on("newPDFLink", (link) => {
      console.log(`${new Date()}\t[Event]   \tnewPDFLink: ${link}`);
    });
  }

  async scrapeSite(url: string) {
    console.log(`${new Date()}\t[Search]\tScraper searching on ${url}`);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);

    //this gives back an actual array, not a node list
    const linkCollection = await page.$$eval("a", (links) => {
      return links.map((link) => {
        return link.href;
      });
    });

    const existingFiles = (await fs.readFile("./pdfLinks.txt", "utf-8")).split(
      "\n"
    );

    for (const link of linkCollection) {
      if (link.includes(".pdf")) {
        if (!existingFiles.find((file) => file === link)) {
          await fs.appendFile("pdfLinks.txt", link + "\n");
          this.emit("newPDFLink", link);
        }
      }
    }

    await browser.close();
  }
}
