const { Markup, Extra } = require('telegraf');
const WizardScene = require('telegraf/scenes/wizard');
const axios = require('axios');
const start = require('../helpers/start')

const surveyScene = new WizardScene(
  'survey',
  async (ctx) => {
    ctx.wizard.state.surveyData = {};
    const surveys = await axios.get('http://127.0.0.1:8000/api/surveys').then(res => res.data);

    if (surveys.length > 0) {
      ctx.wizard.state.surveys = surveys;
      const buttons = surveys.map(survey => Markup.button(survey.name));
      buttons.push(Markup.button(ctx.i18n.t("buttons.mainmenu")))

      ctx.reply(ctx.i18n.t('messages.selectsurvey'), Markup
        .keyboard(buttons)
        .oneTime(false)
        .resize()
        .extra()
      );
      return ctx.wizard.next();
    } else {
      ctx.reply(ctx.i18n.t("messages.surveysnotfound"));
      return ctx.scene.leave();
    }
  },
  (ctx) => {
    const surveys = ctx.wizard.state.surveys
    const survey = surveys.filter(item => item.name === ctx.message.text)[0]

    if (!survey) {
      ctx.reply(ctx.i18n.t("messages.invalidsurvey"));
      return;
    }

    ctx.wizard.state.currentSurvey = survey

    const buttons = survey.branches.map(branch => Markup.button(branch.name))
    buttons.push(Markup.button(ctx.i18n.t("buttons.mainmenu")))

    ctx.replyWithHTML(ctx.i18n.t('messages.selectbranch'), Markup
      .keyboard(buttons)
      .oneTime(true)
      .resize()
      .extra()
    );

    return ctx.wizard.next();
  },
  (ctx) => {
    const survey = ctx.wizard.state.currentSurvey
    const selectedBranch = survey.branches.find(branch => branch.name === ctx.message.text);

    if (!selectedBranch) {
      ctx.reply(ctx.i18n.t("messages.invalidbranch"));
      return;
    }

    ctx.wizard.state.response = {
      survey: survey.id,
      client: ctx.from.id,
      branch: selectedBranch.id,
      answers: []
    }
    ctx.wizard.state.currentQuestionIdx = 1

    if (survey.questions[0].type === 'multiple') {
      const choices = survey.questions[0].choices.split('|')
      const buttons = choices.map(choice => Markup.callbackButton(choice, `choice:${choice}`))

      ctx.replyWithHTML(`<b>${survey.name}</b>\n${survey.description}\n----------\n${survey.questions[0].text}`, Markup
        .inlineKeyboard(buttons)
        .resize()
        .extra()
      )
      return ctx.wizard.next();
    }
    ctx.replyWithHTML(`<b>${survey.name}</b>\n${survey.description}\n----------\n${survey.questions[0].text}`)
    return ctx.wizard.next();
  },
  async (ctx) => {
    const survey = ctx.wizard.state.currentSurvey;
    const answer = ctx.message.text;

    ctx.wizard.state.response.answers.push({
      question: survey.questions[ctx.wizard.state.currentQuestionIdx - 1].id,
      body: answer
    });

    const nextQuestion = ctx.wizard.state.currentSurvey.questions[ctx.wizard.state.currentQuestionIdx];

    if (nextQuestion) {
      if (nextQuestion.type === 'multiple') {
        const choices = nextQuestion.choices.split('|');
        const buttons = choices.map(choice => Markup.callbackButton(choice, `choice:${choice}`));

        ctx.replyWithHTML(`<b>${survey.name}</b>\n${survey.description}\n----------\n${nextQuestion.text}`, Markup
          .inlineKeyboard(buttons)
          .resize()
          .extra()
        );
      } else {
        ctx.replyWithHTML(`<b>${survey.name}</b>\n${survey.description}\n----------\n${nextQuestion.text}`);
      }

      ctx.wizard.state.currentQuestionIdx = ctx.wizard.state.currentQuestionIdx + 1
    } else {
      await sendResults(ctx, survey);
      return ctx.scene.leave();
    }
  }
);

const sendResults = async (ctx, survey) => {
  console.log(ctx.wizard.state.response)
  try {
    const response = await axios.post('http://127.0.0.1:8000/api/survey-response/', ctx.wizard.state.response);
    if (response.status === 201) {
      ctx.replyWithHTML(ctx.i18n.t('messages.surveycompleted'));
      survey.offers[0].img ? ctx.replyWithPhoto({ url: survey.offers[0].img }, Extra.load({
        caption: `${survey.offers[0].description}`
      })) : ctx.replyWithHTML(`${survey.offers[0].description}`);
      start(ctx)
    } else {
      ctx.reply(ctx.i18n.t('messages.error'));
      start(ctx)
    }
  } catch (error) {
    console.error('Error during registration:', error.message);
    ctx.reply(ctx.i18n.t('messages.error'));
    start(ctx)
  }
}

surveyScene.on('callback_query', async (ctx) => {
  const survey = ctx.wizard.state.currentSurvey;

  const callbackData = ctx.callbackQuery.data;
  const choice = callbackData.replace('choice:', '');
  ctx.wizard.state.response.answers.push({
    question: ctx.wizard.state.currentSurvey.questions[ctx.wizard.state.currentQuestionIdx - 1].id,
    body: choice
  });
  const nextQuestion = ctx.wizard.state.currentSurvey.questions[ctx.wizard.state.currentQuestionIdx];

  if (nextQuestion) {
    if (nextQuestion.type === 'multiple') {
      const choices = nextQuestion.choices.split('|');
      const buttons = choices.map(choice => Markup.callbackButton(choice, `choice:${choice}`));

      ctx.replyWithHTML(`<b>${ctx.wizard.state.currentSurvey.name}</b>\n${ctx.wizard.state.currentSurvey.description}\n----------\n${nextQuestion.text}`, Markup.inlineKeyboard(buttons).resize().extra());

      ctx.wizard.state.currentQuestionIdx = ctx.wizard.state.currentQuestionIdx + 1
    } else {
      console.log(ctx.wizard.cursor)

      ctx.replyWithHTML(`<b>${ctx.wizard.state.currentSurvey.name}</b>\n${ctx.wizard.state.currentSurvey.description}\n----------\n${nextQuestion.text}`);

      ctx.wizard.state.currentQuestionIdx = ctx.wizard.state.currentQuestionIdx + 1
    }
  } else {
    await sendResults(ctx, survey);
    return ctx.scene.leave();
  }
});

module.exports = surveyScene;
