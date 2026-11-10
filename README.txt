Verity Bedrock Add-On

Verity is a simple yellow ball companion. The behavior pack includes scripted AI chat support that can send prompts to an administrator-configured HTTPS bridge. The bridge is separate and is not included in this pack.

Package and install

1. Run `python3 package_mcaddon.py` from this project folder. It generates the required 64x64 PNG texture from the source artwork and creates verity.mcaddon containing both packs.
2. Open verity.mcaddon with Minecraft Bedrock to import it.
3. Activate both Verity Behavior Pack and Verity Resource Pack in a world. Enable scripting and HTTP capabilities if your Bedrock version presents those settings.
4. Voice playback is optional. To add it, provide recordings at verity_rp/sounds/voice/verity_greeting.ogg and verity_rp/sounds/voice/verity_warning.ogg, then rerun the packager.

Gameplay

Use /give @s verity:verity_box, then use the box to summon Verity. Interact with him for a greeting, or tame him with a gold nugget so he follows you. After 72,000 ticks, approximately three Minecraft days, Verity becomes hostile and sends the warning.

AI chat setup

The behavior pack listens for messages beginning with !verity, for example: !verity What should we build? Verity must be within 32 blocks. Each player can have one request in flight at a time, and prompts are limited to 500 characters.

The script sends a JSON POST request to the bridge:

{"message":"...","player":"...","character":"Verity, a friendly yellow ball"}

The bridge must reply with HTTP 2xx and JSON in this shape:

{"reply":"A short response from Verity."}

To configure the endpoint in a world:

1. Have an operator run /tag <player> add verity_admin, replacing <player> with the administrator's in-game name.
2. That tagged player sends !verity-admin https://your-bridge.example/chat in chat. The URL must use HTTPS and must not include username or password information.

The bridge should validate requests, limit usage, return short plain-text replies, and keep any AI provider API key in a server environment secret. Never put a key in either pack or in the URL. AI replies will not work until a compatible bridge is deployed and configured.

Compatibility

The behavior manifest declares @minecraft/server 2.0.0 and @minecraft/server-net 1.0.0-beta with minimum engine version 1.21.60. Confirm support for these module versions and HTTP capability settings in the Bedrock version in use.

Source artwork

verity_rp/textures/entity/verity-artwork.svg is the 64x64 yellow-ball source image. The packager creates verity_rp/textures/entity/verity.png for Bedrock before bundling.
