import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()
import { Telegraf } from 'telegraf';
import * as fs from 'fs';
import * as path from 'path';

const bot = new Telegraf(process.env.BOT_TOKEN);

const readIdsFromFile = async(path) => {
    let ids = [];

    let file = path + "ids.txt"
    let file_content = fs.readFileSync(file, 'utf8');
    if ( file_content != null && file_content != "" ) {
        ids = JSON.parse(file_content);
    }
    return ids;
}

bot.command('quit', async (ctx) => {
  // Explicit usage
  await ctx.telegram.leaveChat(ctx.message.chat.id);

  // Using context shortcut
  await ctx.leaveChat();
});

bot.on('text', async (ctx) => {

    if ( ctx.message.text == "registrar" || ctx.message.text == "Registrar" || ctx.message.text == "/Registrar" || ctx.message.text == "/registrar" ) {
    
        let ids = await readIdsFromFile("./");
        ids.push({ id: ctx.message.chat.id});
    
        fs.writeFileSync(
            path.join("./", "ids.txt"),
            JSON.stringify(ids),
            {
                encoding: "utf-8"
            }
        );
    
        await ctx.telegram.sendMessage(ctx.message.chat.id, `Olá ${ctx.message.from.first_name}, seu ID foi registrado para receber as atualizações do Cargas Bot`);
    } else {
        await ctx.telegram.sendMessage(ctx.message.chat.id, `Olá ${ctx.message.from.first_name}`);
    }
 
  // Using context shortcut
  //await ctx.reply(`Hello ${ctx.state.role}`);
});

bot.on('callback_query', async (ctx) => {
  // Explicit usage
  await ctx.telegram.answerCbQuery(ctx.callbackQuery.id);

  // Using context shortcut
  await ctx.answerCbQuery();
});

bot.on('inline_query', async (ctx) => {
  const result = [];
  // Explicit usage
  await ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result);

  // Using context shortcut
  await ctx.answerInlineQuery(result);
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));