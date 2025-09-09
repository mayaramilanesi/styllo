import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";

import { generateResponse } from "./ai/aiEngine.js"

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
    
    const text = msg.message.conversation?.trim() ?? ""
    const jid = msg.key.remoteJid!

    if (text.toLowerCase() === "ping") {
      await sock.sendMessage(jid, { text: "pong" })
      return
    }

    if (text.length > 1500) {
      await sock.sendMessage(jid, {
        text:
          "Mensagem muito longa para resposta automática. Pode resumir um pouco? 🙂",
      })
      return
    }

    const context = "User profile: TBD. Prefers concise, practical style tips."

    if (!process.env.OPENAI_API_KEY) {
      await sock.sendMessage(jid, {
        text:
          "No momento estou sem meu motor de IA. Tente novamente em alguns minutos!",
      })
      return
    }

    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 25_000) // 25s
      const reply = await generateResponse(context, text)
      clearTimeout(timer)

      const safeReply =
        reply?.trim() ||
        "Hmm… não tenho certeza. Pode me dar um pouco mais de contexto?"

      await sock.sendMessage(jid, { text: safeReply })
    } catch (err: any) {
      console.error("[AI ERROR]", err?.message || err)
      await sock.sendMessage(jid, {
        text:
          "Tive um probleminha para pensar na resposta agora 😅. Tenta de novo já já.",
      })
    }
  });
}
