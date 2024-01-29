const WizardScene = require('telegraf/scenes/wizard');
const isValidPhoneNumber = require('../helpers/checkPhoneNumber');
const axios = require('axios');
const { Markup } = require('telegraf');

const regScene = new WizardScene(
  'register',
  (ctx) => {
    ctx.replyWithHTML(ctx.i18n.t('messages.phone'), Markup
      .keyboard([
        [Markup.contactRequestButton(ctx.i18n.t('buttons.phone'))],
      ])
      .oneTime(true)
      .resize()
      .extra());
    ctx.wizard.state.contactData = {
      id: ctx.from.id
    };
    return ctx.wizard.next();
  },
  (ctx) => {
    if (!(isValidPhoneNumber(ctx.message.text) || (ctx.message.contact && isValidPhoneNumber(ctx.message.contact.phone_number)))) {
      ctx.replyWithHTML(ctx.i18n.t('messages.invalidphone'));
      return;
    }
    ctx.wizard.state.contactData.phone_number = ctx.message.contact ? ctx.message.contact.phone_number : ctx.message.text;
    ctx.replyWithHTML(ctx.i18n.t('messages.fullname'));
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.contactData.full_name = ctx.message.text;
    ctx.replyWithHTML(ctx.i18n.t('messages.gender'), Markup
      .keyboard([
        [Markup.callbackButton('М'), Markup.callbackButton('Ж')],
      ])
      .oneTime(false)
      .resize()
      .extra()
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    if (!['М', 'Ж'].includes(ctx.message.text)) {
      ctx.replyWithHTML(ctx.i18n.t('messages.invalidgender'));
      return;
    }
    ctx.wizard.state.contactData.gender = ctx.message.text;
    ctx.replyWithHTML(ctx.i18n.t('messages.age'));
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (isNaN(ctx.message.text)) {
      ctx.replyWithHTML(ctx.i18n.t('messages.invalidage'));
      return;
    }
    ctx.wizard.state.contactData.age = ctx.message.text;
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/user-create/', ctx.wizard.state.contactData);

      if (response.status === 201) {
        ctx.replyWithHTML(ctx.i18n.t('messages.regcompleted'));
      } else {
        ctx.reply(ctx.i18n.t('messages.error'));
      }
    } catch (error) {
      console.error('Error during registration:', error);
      ctx.reply(ctx.i18n.t('messages.error'));
    }
    console.log(ctx.wizard.state.contactData)
    return ctx.scene.leave();
  },
);

module.exports = regScene