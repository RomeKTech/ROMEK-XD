import config from '../../config.cjs';
import pkg, { prepareWAMessageMedia } from '@whiskeysockets/baileys';
import Jimp from 'jimp';
const { generateWAMessageFromContent, proto } = pkg;

const alive = async (m, Matrix) => {
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / (3600 * 24));
  const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  const timeString = `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  // Sender's JID
  const jid = m.from || m.key.remoteJid;
  console.log('Sender JID:', jid); // Debugging JID

  if (['alive', 'uptime', 'runtime'].includes(cmd)) {
    const width = 800;
    const height = 500;
    const image = new Jimp(width, height, 'black');
    const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
    const textMetrics = Jimp.measureText(font, timeString);
    const textHeight = Jimp.measureTextHeight(font, timeString, width);
    const x = (width / 2) - (textMetrics / 2);
    const y = (height / 2) - (textHeight / 2);
    image.print(font, x, y, timeString, width, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE);
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

    const uptimeMessage = `*🤖 ROMEK-XD Status Overview*
_________________________________________

*📆 Uptime:* ${days} Day(s), ${hours} Hour(s), ${minutes} Minute(s), ${seconds} Second(s)

*📌 Bot is Running Smoothly!*
_________________________________________
`;

    const msg = generateWAMessageFromContent(jid, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: uptimeMessage,
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: "© ᴘᴏᴡᴇʀᴅ ʙʏ ʀᴏᴍᴇᴋ-xᴅ",
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              ...(await prepareWAMessageMedia({ image: buffer }, { upload: Matrix.waUploadToServer })),
              title: ``,
              gifPlayback: false,
              subtitle: "",
              hasMediaAttachment: false,
            }),
            contextInfo: {
              quotedMessage: m.message,
              forwardingScore: 999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363321472746562@newsletter',
                newsletterName: "𝐑𝐎𝐌𝐄𝐊 𝐗𝐃",
                serverMessageId: 143,
              },
            },
          }),
        },
      },
    }, {});

    // Send message to the JID
    await Matrix.relayMessage(jid, msg.message, {
      messageId: msg.key.id,
    });
  }
};

export default alive;