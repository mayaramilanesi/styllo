import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";


let _connectionStatus: 'connecting' | 'open' | 'close' | 'unknown' = 'unknown'

export const getConnectionStatus = () => _connectionStatus

export async function createSocket() {
  const { state, saveCreds } = await useMultiFileAuthState("Baileys_auth");

  const sock = makeWASocket({
    auth: state,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) qrcode.generate(qr, { small: true });

    if (connection) _connectionStatus = connection;

    if (connection === "close") {
      const reason =
        (lastDisconnect?.error as any)?.output?.statusCode ??
        DisconnectReason.connectionClosed;
      if (reason !== DisconnectReason.loggedOut) createSocket();
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages?.[0];
    if (!msg) return;

    if (!msg.message || msg.key.fromMe) return;
    
    const text = msg.message.conversation ?? "";
    if (text.toLowerCase() === "ping") {
      await sock.sendMessage(msg.key.remoteJid!, { text: "pong" });
    }
  });
}
