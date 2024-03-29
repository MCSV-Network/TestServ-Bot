const { SlashCommandBuilder } = require('discord.js');
const config = require("../config.json");
const path = require('path');
const fs = require('fs')
const axios = require('axios')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deploy')
        .setDescription('ファイルをサーバーにデプロイ')
        .addAttachmentOption(option =>
            option
                .setName("file")
                .setRequired(true)
                .setDescription("デプロイするファイル")
		),
    execute: async function (
        /** @type {import('discord.js').CommandInteraction} */
        interaction) {
        if (!config.allowlist) {
            return interaction.reply("ねえなんで設定ファイルに`allowlist`が記述されてないの？");
        }
        if (!config.allowlist.includes(interaction.user.id)) {
            return interaction.reply({
                content: "ねえ君権限ないよ？ざぁこざぁこ♡www権限ないのに好奇心でコマンド実行しちゃうなんてかわいいね",
                ephemeral: true
            });
        }
        await interaction.deferReply();
        let attachment = interaction.options.getAttachment('file');
		await interaction.editReply(`${attachment.attachment}をデプロイ中...`)
		console.log(attachment.attachment);
		let res = await axios.get(attachment.attachment,{ responseType: "arraybuffer" });
		let file = Buffer.from(res.data);

        try {
            // サーバー内の保存ディレクトリのパス
            const saveDirectory = config.savepath
            
            // ファイルの保存先のパス
            const filePath = path.join(saveDirectory, attachment.name);

            // ファイルを保存
            await fs.writeFileSync(filePath, file);

            interaction.editReply(`${attachment.name}をデプロイしました!`);
        } catch (e) {
            await interaction.editReply({
                embeds: [{
                    title: "エラー",
                    description: '管理者がミスをしました。鯖ログを見るよう指示してください。' + '\n```' + e + '\n```',
                    color: 0xff0000,
                    footer: {
                        text: "uwu"
                    }
                }]
            })
			console.log(e);
        }
    },
};
