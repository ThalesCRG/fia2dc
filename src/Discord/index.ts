import { WebhookClient } from "discord.js";
import { statSync } from "fs";
import { Logger, LogTypes } from "../Logger";

const logger = new Logger();

export class DiscordWebhook {
  webhookClient: WebhookClient;

  constructor(url: string) {
    this.webhookClient = new WebhookClient({
      url,
    });
  }

  async releaseAFile(file: string) {
    try {
      logger.log(LogTypes.DC_WEBHOOK_SEND, file);

      const stats = statSync(file);
      await this.webhookClient.send({
        embeds: [
          {
            title: "The FIA just released a new File",
            description:
              "The FIA has just released a new Document regarding Formula One. Let me just post it here..",
            fields: [
              {
                name: "File name:",
                value: file.split("\\").pop() ?? "not found",
                inline: true,
              },
              {
                name: "File size:",
                value: "" + stats.size,
                inline: true,
              },
            ],
            timestamp: new Date(stats.birthtime).toISOString(),
          },
        ],
      });
      await this.webhookClient.send({
        files: [
          {
            attachment: file,
            name: file.split("\\").pop(),
          },
        ],
      });
    } catch (error) {
      logger.log(LogTypes.DC_WEBHOOK_ERROR, error);
    }
  }
}
