import axios from "axios";
import EventEmitter from "events";
import { existsSync, mkdirSync, readFileSync, createWriteStream } from "fs";
import path from "path";
import { Logger, LogTypes } from "../Logger";

const logger = new Logger();

const WORKING_DIR = process.cwd();
const FILE_DIR = path.join(WORKING_DIR, "files");
const LINK_FILE = path.join(WORKING_DIR, "config", "pdfLinks.txt");

export enum EVENT_TYPES {
  DOWNLOAD_FILE = "downloadFile",
  SAVED_FILE = "SAVED_FILE",
}

export class Downloader extends EventEmitter {
  downloadAll() {
    if (!existsSync(LINK_FILE)) {
      logger.log(LogTypes.READING_LINKS, "No link file found");
      return;
    }
    const files = readFileSync(LINK_FILE, "utf-8").split("\n");
    if (!files) {
      logger.log(LogTypes.READING_LINKS, "No links found");
      return;
    }
    for (const file of files) {
      new Downloader().downloadFile(file);
    }
  }
  constructor() {
    super();
    this.on(EVENT_TYPES.DOWNLOAD_FILE, (fileName) => {
      logger.log(LogTypes.DOWNLOAD, fileName);
    });
  }

  async downloadFile(fileURI: string) {
    let fileName = fileURI.split("/").pop();
    const pathToSave = path.join(FILE_DIR, decodeURI(fileName as string));

    if (!existsSync(FILE_DIR)) {
      mkdirSync(FILE_DIR);
    }

    const existingAllready = existsSync(pathToSave);
    if (!existingAllready) {
      this.emit(EVENT_TYPES.DOWNLOAD_FILE, fileName);
      await this.download(fileURI, "./" + fileName);
    }
  }

  private async download(fileUrl: string, fileName: string) {
    try {
      const pathToSave = path.join(FILE_DIR, decodeURI(fileName as string));

      const writer = createWriteStream(pathToSave);
      const response = await axios.get(fileUrl, { responseType: "stream" });

      response.data.pipe(writer);
      writer.on("close", () => this.emit(EVENT_TYPES.SAVED_FILE, writer.path));
    } catch (error) {
      logger.log(LogTypes.ERROR_IN_DOWNLOAD, error);
    }
  }
}
