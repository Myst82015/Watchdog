import BaseCommand from "../../structures/BaseCommand";
import Context from "../../structures/Context";
import config from "../../config.json";
import { execSync } from "child_process";
import DiscordEmbed from "../../utils/DiscordEmbed";
import { Message } from "eris";
import Watchdog from "../../structures/Watchdog";
export default class Update extends BaseCommand {
    constructor() {
        super({
            name: "update",
            description: "Update the bot",
            usage: "update",
            aliases: [],
            requirements: [],
            deleteMessage: false,
        });
    }

    async execute(ctx: Context, base: Watchdog) {
        const message: Message = await ctx.send("Executing code...");
        const code: string = "git pull";
        const embed: DiscordEmbed = new DiscordEmbed().setTitle("Exec");

        function redact(code: string) {
            const tokens = [
                config.bot.token,
                config.database.host,
                config.database.username,
                config.database.password
                    .replace("*", "\\*")
                    .replace("^", "\\^"),
            ];

            const regex = new RegExp(tokens.join("|"), "gi");
            return code.replace(regex, "|REDACTED|");
        }

        try {
            const res = redact(execSync(code).toString().trim());
            embed.addField("Output", `\`\`\`js\n${res}\`\`\``);
            await message.edit({ content: "", embed: embed.getEmbed() });
        } catch (e) {
            embed.setColor(parseInt(config.bot.color));
            embed.addField("Error", `\`\`\`js\n${e.message}\`\`\``);
            await message.edit({ content: "", embed: embed.getEmbed() });
        }

        console.log("Restarting the bot");
        base.ipc.restartAllClusters();
    }
}
