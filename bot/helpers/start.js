const getUser = require("./getUser");
const sendLanguage = require("./sendLang");
const { Markup } = require('telegraf')

const start = async (ctx) => {
  const check = await getUser(ctx.from.id)
  if (!check) {
    if (!ctx.session.language || ctx.session.language == "reset") {
      return sendLanguage(ctx);
    }
  } else {
    ctx.replyWithHTML(ctx.i18n.t('messages.start'), Markup
      .keyboard([
        [Markup.callbackButton(ctx.i18n.t('buttons.join'), 'join')],
        [Markup.callbackButton(ctx.i18n.t('buttons.changelang'), 'setlanguage:reset')],
      ])
      .oneTime(false)
      .resize()
      .extra()
    )
  }
}

module.exports = start