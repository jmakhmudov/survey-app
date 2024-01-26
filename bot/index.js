import axios from "axios";
import { Markup, Telegraf, session, Scenes } from "telegraf";
import { Stage } from "telegraf/typings/scenes";

const getUser = async (id) => {
	try {
		const response = await axios.get(`http://127.0.0.1:8000/api/user-create/${id}`);
		return response.data;
	} catch (error) {
		if (error.response && error.response.status === 404) {
			return undefined;
		} else {
			console.error("An error occurred while fetching user data", error.message);
			throw error;
		}
	}
};

const bot = new Telegraf('6428031744:AAF2POTizOUsK_LOSfVFd9ptNcumNyp9oFE');

bot.command('start', (ctx) => {
	ctx.scene.enter('CONTACT_DATA_WIZARD_SCENE_ID')
})


const contactDataWizard = new Scenes.WizardScene(
	'CONTACT_DATA_WIZARD_SCENE_ID', // first argument is Scene_ID, same as for BaseScene
	(ctx) => {
		ctx.reply('What is your name?');
		ctx.wizard.state.contactData = {};
		return ctx.wizard.next();
	},
	(ctx) => {
		// validation example
		if (ctx.message.text.length < 2) {
			ctx.reply('Please enter name for real');
			return;
		}
		ctx.wizard.state.contactData.fio = ctx.message.text;
		ctx.reply('Enter your e-mail');
		return ctx.wizard.next();
	},
	async (ctx) => {
		ctx.wizard.state.contactData.email = ctx.message.text;
		ctx.reply("Thank you for your replies, we'll contact your soon");
		await mySendContactDataMomentBeforeErase(ctx.wizard.state.contactData);
		return ctx.scene.leave();
	},
);

const stage = new Stage()
bot.use(stage.middleware())

const scenarioTypeScene = new Scenes.BaseScene('SCENARIO_TYPE_SCENE_ID');

scenarioTypeScene.enter((ctx) => {
	ctx.session.myData = {};
	ctx.reply('What is your drug?', Markup.inlineKeyboard([
		Markup.callbackButton('Movie', 'MOVIE_ACTION'),
		Markup.callbackButton('Theater', 'THEATER_ACTION'),
	]).extra());
});

scenarioTypeScene.action('THEATER_ACTION', (ctx) => {
	ctx.reply('You choose theater');
	ctx.session.myData.preferenceType = 'Theater';
	return ctx.scene.enter('SOME_OTHER_SCENE_ID'); // switch to some other scene
});

scenarioTypeScene.action('MOVIE_ACTION', (ctx) => {
	ctx.reply('You choose movie, your loss');
	ctx.session.myData.preferenceType = 'Movie';
	return ctx.scene.leave(); // exit global namespace
});

scenarioTypeScene.leave((ctx) => {
	ctx.reply('Thank you for your time!');
});

// What to do if user entered a raw message or picked some other option?
scenarioTypeScene.use((ctx) => ctx.replyWithMarkdown('Please choose either Movie or Theater'));

bot.use(session());
bot.launch();
