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
      const stats = statSync(file);
      const images = this.generateImageEmbeds(file);

      const embedMessage = {
        URL: `${HOME_URI + encodeURI(images[0].name)}`,
        embeds: [
          {
            URL: `${HOME_URI + encodeURI(images[0].name)}`,
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
      };
      images.forEach((thisimage, index) => {
        if (index !== 0)
          embedMessage.embeds.push({
            URL: `${HOME_URI + encodeURI(images[0].name)}`,
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
            image: { url: HOME_URI + encodeURI(thisimage.name) },
          });
      });

      await this.webhookClient.send(embedMessage);

      const fileMessage = {
        files: [
          {
            attachment: file,
            name: file.split(path.sep).pop(),
          },
        ],
      };

      await this.webhookClient.send(fileMessage);
      logger.log(LogTypes.DC_WEBHOOK_SEND, file);
    } catch (error) {
      logger.log(LogTypes.DC_WEBHOOK_ERROR, JSON.stringify(error));
    }
  }
}
