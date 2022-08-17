import axios from "axios";
import { Scraper } from "./Scraper";
import { Downloader } from "./Downloader";
require("dotenv").config();

const scraper = new Scraper();
const downloader = new Downloader();

setInterval(() => {
  scraper.scrapeSite(process.env.FIA_DOCS_URI as string);
}, 10000);

scraper.on("newPDFLink", async (link) => {
  await downloader.downloadFile(link);
});

downloader.downloadAll();

// async function testWebhook(file: string) {
//   try {
//     const response = await axios.post(
//       process.env.WEBHOOK_URI as string,
//       {
//         content: "New Fia Document!",
//         // embeds: [
//         //   {
//         //     title: "Discord Webhook Example",
//         //     color: 5174599,
//         //     footer: {
//         //       text: `📅 `,
//         //     },
//         //     fields: [
//         //       {
//         //         name: "Field Name",
//         //         value: "Field Value",
//         //       },
//         //     ],
//         //   },
//         // ],
//         attachments: [
//           {
//             id: 0,
//             description: "New Fia Document",
//             filename: file,
//           },
//         ],
//       },
//       { headers: { "Content-Type": "application/json" } }
//     );
//     console.log(`res: [${response}]`);
//   } catch (errors) {
//     console.log(errors);
//   }
// }

// // testWebhook("./49564461766_e230dc4a51_k.jpg");
