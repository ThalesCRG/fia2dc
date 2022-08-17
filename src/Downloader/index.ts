import axios from "axios";
import EventEmitter from "events";
import { createWriteStream, existsSync, readFileSync } from "fs";
import fs from "fs/promises";
import path from "path";

const DIR_NAME = path.join(__dirname, "files");

export class Downloader extends EventEmitter {
  downloadAll() {
    const files = readFileSync(path.join("./", "pdfLinks.txt"), "utf-8").split(
      "\n"
    );
    for (const file of files) {
      new Downloader().downloadFile(file);
    }
  }
  constructor() {
    super();
    this.on("downloadFile", (fileName) => {
      console.log(`${new Date()}\t[DOWNLOAD] ${decodeURI(fileName)}`);
    });
  }

  async downloadFile(fileURI: string) {
    let fileName = fileURI.split("/").pop();
    const joinedPath = path.join(DIR_NAME, decodeURI(fileName as string));

    if (!existsSync(DIR_NAME)) {
      await fs.mkdir(DIR_NAME);
    }
    const existingAllready = existsSync(joinedPath);
    if (!existingAllready) {
      this.emit("downloadFile", fileName);
      this.download(fileURI, "./" + fileName);
    }
  }

  private async download(fileUrl: string, fileName: string): Promise<any> {
    const joinedPath = path.join(DIR_NAME, decodeURI(fileName as string));

    const writer = createWriteStream(joinedPath);
    console.log(`Downloading ${decodeURI(fileName)}`);
    const response = await axios.get(fileUrl, { responseType: "stream" });

    response.data.pipe(writer);
  }
}
