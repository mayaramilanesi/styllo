import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";

export async function createSocket() {
  // 1) cria/recupera o estado de autenticação
  const { state, saveCreds } = await useMultiFileAuthState("Baileys_auth");

  // 2) passa o "auth" no config
  const sock = makeWASocket({
    auth: state,
  });

  // 3) salva credenciais sempre que mudarem
  sock.ev.on("creds.update", saveCreds);

  // 4) reconexão simples
  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) qrcode.generate(qr, { small: true }); // agora existe
    if (connection === "close") {
      const reason =
        (lastDisconnect?.error as any)?.output?.statusCode ??
        DisconnectReason.connectionClosed;
      if (reason !== DisconnectReason.loggedOut) createSocket();
    }
  });

  // 5) echo ping→pong
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
