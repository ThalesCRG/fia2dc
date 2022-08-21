import { WebhookClient } from "discord.js";
import { readdirSync, statSync } from "fs";

import path from "path";
import { IMAGE_PATH } from "../Converter";
import { Logger, LogTypes } from "../Logger";

const logger = new Logger();

const HOME_URI = "https://fia.rdc-racing.de/";

export class DiscordWebhook {
  webhookClient: WebhookClient;

  constructor(url: string) {
    this.webhookClient = new WebhookClient({
      url,
    });
  }

  private findPictures(file: string) {
    const allImages = readdirSync(IMAGE_PATH);
    const filename = file.split(path.sep).pop();
    if (!filename) return [];
    const fileImages = allImages.filter((image) => {
      return image.startsWith(filename);
    });
    return fileImages;
  }

  private generateImageEmbeds(file: string) {
    const pictures = this.findPictures(file).map((picture) =>
      path.join(IMAGE_PATH, picture)
    );
    console.log(pictures);
    const result: Array<{ name: string; path: string }> = [];

    for (const file of pictures) {
      const picture = {
        name: file.split(path.sep).pop() ?? "undefined",
        path: file,
      };
      result.push(picture);
    }
    return result;
  }

  async releaseAFile(file: string) {
    try {
      logger.log(LogTypes.DC_WEBHOOK_SEND, file);

      const stats = statSync(file);
      const images = this.generateImageEmbeds(file);

      await this.webhookClient.send({
        embeds: [
          {
            title: "The FIA just released a new File",
            description:
              "The FIA has just released a new Document regarding Formula One. Let me just post it here..",
            fields: [
              {
                name: "File name:",
                value: file.split(path.sep).pop() ?? "not found",
                inline: true,
              },
              {
                name: "File size:",
                value: "" + stats.size,
                inline: true,
              },
            ],
            timestamp: new Date(stats.birthtime).toISOString(),
            image: { url: HOME_URI + encodeURI(images[0].name) },
          },
        ],
      });

      await this.webhookClient.send({
        files: [
          {
            attachment: file,
            name: file.split(path.sep).pop(),
          },
        ],
      });
    } catch (error) {
      logger.log(LogTypes.DC_WEBHOOK_ERROR, JSON.stringify(error));
    }
  }
}
