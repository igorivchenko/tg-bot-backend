import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const token = process.env.BOT_TOKEN;
const webAppUrl = 'https://48afa5a83ce9.ngrok-free.app';

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Перейдіть у віконце і заповніть форму', {
      reply_markup: {
        keyboard: [[{ text: 'Форма', web_app: { url: `${webAppUrl}/form` } }]],
      },
    });
  }

  // await bot.sendMessage(chatId, "Нижче з'явиться кнопка, перейдіть на сайт", {
  //   reply_markup: {
  //     inline_keyboard: [[{ text: 'Сайт', web_app: { url: webAppUrl } }]],
  //   },
  // });

  if (msg.web_app_data?.data) {
    try {
      const data = JSON.parse(msg.web_app_data.data);

      await bot.sendMessage(chatId, 'Дякуємо за ваш фідбек!');
      await bot.sendMessage(chatId, `Ваша країна: ${data.country}`);
      await bot.sendMessage(chatId, `Ваша місто: ${data.city}`);
      await bot.sendMessage(chatId, `Ваш статус: ${data.subject}`);

      setTimeout(async () => {
        await bot.sendMessage(
          chatId,
          `Всю інформацію ви отримаєте в цьому чаті`
        );
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  }
});

app.post('/web-data', async (req, res) => {
  const { queryId, products, totalPrice } = req.body;

  const productsText = products.map((p) => `${p.title}: ${p.price}`).join('\n');

  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Успішна покупка',
      message_text: `Вітаю з покупкою на суму ${totalPrice}!\nКуплені товари:\n${productsText}`,
    });
    return res.status(200).json({});
  } catch (error) {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Нажаль, не вдалося купити товар',
      input_message_content: {
        message_text: 'Нажаль, не вдалося купити товар',
      },
    });
    return res.status(500).json({});
  }
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
