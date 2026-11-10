# Minecraft Bedrock Companion Add-On

Verity: The Yellow Oracle is a Minecraft Bedrock companion add-on with a 3D yellow ball mob, idle and movement animations, a summon box, player-following behavior after taming, interaction messages, and optional AI chat through a separately configured HTTPS bridge.

## Install

1. Run `python3 package_mcaddon.py` in the project folder to generate `verity.mcaddon`.
2. Open `verity.mcaddon` with Minecraft Bedrock to import the behavior pack and resource pack.
3. In your world’s settings, activate both Verity packs. Enable scripting and HTTP capabilities if your Minecraft version offers those settings.
4. For optional voice playback, add `verity_greeting.ogg` and `verity_warning.ogg` under `verity_rp/sounds/voice/` before packaging. These recordings are not included.

## Use

1. Run `/give @s verity:verity_box`, then use the box to place Verity.
2. Interact with Verity to see the greeting. Give him a gold nugget to tame him so he follows you.
3. After 72,000 ticks, approximately three Minecraft days, Verity becomes hostile and attacks nearby players. The warning message and voice sound are triggered by this change.
4. Optional AI chat requires a separately deployed compatible HTTPS bridge. Give an operator the `verity_admin` tag with `/tag <player> add verity_admin`, then have that operator send `!verity-admin https://your-bridge.example/chat`. With Verity within 32 blocks, send `!verity <message>` to chat with the configured service. The bridge must accept the documented JSON request and return a JSON `reply` string. No AI service or bridge is included.

---

More Minecraft plugin projects by EnderDevelopment: https://github.com/EnderDevelopment

Project page: https://dash.enderdevelopment.com/community/a72613bb-7ab2-4f55-81da-71d4151566f1?utm_source=github&utm_medium=readme&utm_campaign=auto_publish&utm_content=a72613bb-7ab2-4f55-81da-71d4151566f1
