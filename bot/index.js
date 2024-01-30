const TelegrafI18n = require('telegraf-i18n')
const Telegraf = require('telegraf')
const {
  Markup,
  Extra
} = require('telegraf')
const path = require('path');
const getUser = require('./helpers/getUser');
const { Stage, session } = require('telegraf');
const regScene = require('./scenes/reg');
const sendLanguage = require('./helpers/sendLang');
const start = require('./helpers/start');
const surveyScene = require('./scenes/survey');
require('dotenv').config();

const i18n = new TelegrafI18n({
  defaultLanguage: 'ru',
  useSession: true,
  directory: path.resolve(__dirname, 'locales')
})

const bot = new Telegraf(process.env.BOT_TOKEN)

const stage = new Stage([regScene, surveyScene]);
bot.use(session())
bot.use(i18n.middleware())
bot.use(stage.middleware());

surveyScene.hears([TelegrafI18n.match('buttons.mainmenu')], async (ctx) => {
  ctx.scene.leave()
  start(ctx)
})


bot.command('start', async (ctx) => {
  start(ctx)
});

bot.command('setlanguage', (ctx, next) => {
  return sendLanguage(ctx)
});

bot.on('callback_query', async (ctx, next) => {
  let [type] = ctx.callbackQuery.data.split(":");

  if (type == "setlanguage") {
    let [type, language] = ctx.callbackQuery.data.split(":");
    switch (language) {
      case "ru":
        ctx.session.language = "ru"
        ctx.session.__language_code = "ru"
        break;
      case "uz":
        ctx.session.language = "uz"
        ctx.session.__language_code = "uz"
        break;
      case "reset":
        ctx.reply(ctx.i18n.t('messages.changelang'), Markup.removeKeyboard(true).extra()).then(e => ctx.deleteMessage(e.message_id))
        ctx.session.language = "reset"
        break;
    }

    ctx.i18n.locale(ctx.session.language)
    ctx.answerCbQuery();
    ctx.deleteMessage()
    ctx.reply(ctx.i18n.t('messages.languageChanged'), Markup
      .keyboard([
        [Markup.callbackButton(ctx.i18n.t('buttons.join'), 'join')],
        [Markup.callbackButton(ctx.i18n.t('buttons.changelang'), 'setlanguage:reset')],
      ])
      .oneTime(false)
      .resize()
      .extra()
    )

    const check = await getUser(ctx.from.id)

    if (!check) ctx.scene.enter('register')
  } else {
    return next()
  }
})

bot.on('text', (ctx) => {
  const messageText = ctx.message.text.toLowerCase();

  if (messageText === ctx.i18n.t('buttons.join').toLowerCase()) {
    ctx.scene.enter('survey')
  }
  if (messageText === ctx.i18n.t('buttons.changelang').toLowerCase()) {
    sendLanguage(ctx)
  }
})

bot.command('debug', (ctx) => {
  console.log('Debug command received:', ctx.message)
  ctx.reply('Debug command received!')
})

bot.catch((err) => {
  console.log('Ooops', err)
})
bot.launch()
