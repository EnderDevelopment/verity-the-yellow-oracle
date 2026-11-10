import { world, system } from "@minecraft/server";
import { http, HttpRequest, HttpRequestMethod, HttpHeader } from "@minecraft/server-net";

const PREFIX = "!verity ";
const ADMIN_PREFIX = "!verity-admin ";
const ENTITY_ID = "verity:verity";
const MAX_PROMPT_LENGTH = 500;
const MAX_REPLY_LENGTH = 800;
const pendingPlayers = new Set();

world.beforeEvents.chatSend.subscribe((event) => {
  const message = event.message.trim();
  const lowerMessage = message.toLowerCase();
  const player = event.sender;

  if (lowerMessage.startsWith(ADMIN_PREFIX)) {
    event.cancel = true;
    const endpoint = message.slice(ADMIN_PREFIX.length).trim();
    system.run(() => configureEndpoint(player, endpoint));
    return;
  }
  if (!lowerMessage.startsWith(PREFIX)) return;

  event.cancel = true;
  const prompt = message.slice(PREFIX.length).trim().slice(0, MAX_PROMPT_LENGTH);
  if (!prompt) {
    system.run(() => player.sendMessage("Usage: !verity <message>"));
    return;
  }

  system.run(() => askVerity(player, prompt));
});

function configureEndpoint(player, endpoint) {
  if (!player.hasTag("verity_admin")) {
    player.sendMessage("Only players with the verity_admin tag can configure Verity.");
    return;
  }
  if (!isAllowedEndpoint(endpoint)) {
    player.sendMessage("Usage: !verity-admin https://your-trusted-bridge.example/chat");
    return;
  }
  world.setDynamicProperty("verity:ai_endpoint", endpoint);
  player.sendMessage("Verity's AI bridge endpoint was configured.");
}

async function askVerity(player, prompt) {
  if (pendingPlayers.has(player.id)) {
    player.sendMessage("Verity is still thinking about your last message.");
    return;
  }

  const endpoint = world.getDynamicProperty("verity:ai_endpoint");
  if (typeof endpoint !== "string" || !isAllowedEndpoint(endpoint)) {
    player.sendMessage("AI chat is not configured. An administrator must set a trusted HTTPS bridge URL.");
    return;
  }

  const nearby = player.dimension.getEntities({ type: ENTITY_ID, location: player.location, maxDistance: 32 });
  if (nearby.length === 0) {
    player.sendMessage("Bring Verity within 32 blocks to chat with him.");
    return;
  }

  const request = new HttpRequest(endpoint);
  request.method = HttpRequestMethod.Post;
  request.headers = [new HttpHeader("Content-Type", "application/json")];
  request.timeout = 15;
  request.body = JSON.stringify({ message: prompt, player: player.name, character: "Verity, a friendly yellow ball" });

  pendingPlayers.add(player.id);
  try {
    player.sendMessage("Verity is thinking...");
    const response = await http.request(request);
    if (response.status < 200 || response.status >= 300) {
      player.sendMessage("Verity could not reach his AI service right now.");
      return;
    }
    let payload;
    try {
      payload = JSON.parse(response.body);
    } catch {
      player.sendMessage("Verity's AI service returned an invalid response.");
      return;
    }
    if (!payload || typeof payload.reply !== "string" || payload.reply.trim().length === 0) {
      player.sendMessage("Verity's AI service returned an empty reply.");
      return;
    }

    player.sendMessage(`Verity: ${payload.reply.trim().slice(0, MAX_REPLY_LENGTH)}`);
    for (const entity of nearby) {
      try {
        entity.triggerEvent("verity:talk");
      } catch {
        // The entity may unload while the service request is running.
      }
    }
  } catch {
    player.sendMessage("Verity could not reach his AI service right now.");
  } finally {
    pendingPlayers.delete(player.id);
  }
}

function isAllowedEndpoint(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.username === "" && url.password === "";
  } catch {
    return false;
  }
}

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  if (event.target.typeId === ENTITY_ID) {
    event.player.sendMessage("Ask Verity anything with !verity <message>.");
  }
});
