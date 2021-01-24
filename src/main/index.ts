import * as TelegramBot from 'node-telegram-bot-api';
import {Message} from "node-telegram-bot-api";
import {IListDocument, IListModel} from "./models/list.types";
import {get} from "mongoose";

const TOKEN = '1327351227:AAE7TGQt5hKvuazXQQIbgL-hCfJmpU0QBKQ';
const kb = require('./keyboard-buttons');
const keyboard = require('./keyboard');
const bot = new TelegramBot(TOKEN, {
    polling: true
})
const listDbService = require('./services/ListDbService')

const ACTION_TYPE = {
    DELETE_LIST: 'dl',
    FIND_LIST: 'fl'
}
//==================================================

bot.onText(/\/start/, (msg: Message) => {
    const text = `Привет, ${msg.from?.first_name}.\n` +
        `Я бот для создания списков покупок. Выбирете команду для работы со мной:`
    bot.sendMessage(msg.chat.id, text, {
        reply_markup: {
            keyboard: keyboard.home
        }
    })
})

bot.onText(/\/help/, (msg: Message) => {
    Help(msg.chat.id)
})

bot.onText(/\/addlist/, (msg: Message) => {
    addNewList(msg.chat.id);
})

bot.onText(/\/showlists/, (msg: Message) => {
    getLists(msg.chat.id)
})

bot.on('message', (msg: Message) => {
    switch (msg.text) {
        case kb.home.lists:
            getLists(msg.chat.id)
            break
        case kb.home.add_list:
            addNewList(msg.chat.id)
            break
        case kb.home.help:
            Help(msg.chat.id)
            break
        case kb.back:
            bot.sendMessage(msg.chat.id, 'Что хотите сделать?', {
                reply_markup: {keyboard: keyboard.home}
            })
            break
    }

})

bot.on('callback_query', query => {
    const userId = query.from.id;
    let data = JSON.parse(<string>query.data)
    const {type} = data;
    if (type === ACTION_TYPE.DELETE_LIST) {
        delList(userId, data.name);
    }
    if(type === ACTION_TYPE.FIND_LIST) {
        getList(data.id, userId);
    }
})

//================================

function Help(chatId: number) {
    const text = 'Вот список доступных команд: \n' +
        '🗒 Мои списки - /showlists - показать все доступные списки покупок\n' +
        '➕ Добавить список /addlist – добавить новый список покупок\n' +
        '🖊 Отзыв /feedback - сообщить о проблемах или пожеланиях\n' +
        '⛔ Стоп /stop - отписаться от бота'
    bot.sendMessage(chatId, text, {
        reply_markup: {
            keyboard: keyboard.help
        }
    })
}

function getLists(chatId: number) {
    const listQuery = listDbService.getLists(chatId);
    if (listQuery) {
        listQuery.then((listItems: IListDocument[]) => {
            const check = listItems.map((item: IListDocument) => {
                return `${item.name}`
            }).join('\n')
            if (!check) {
                const text = 'Не добавлено ни одного списка.\n' +
                    'Их можно добавить через кнопку Добавить список или команду /addlist'
                bot.sendMessage(chatId, text)
            } else {
                bot.sendMessage(chatId, 'Все доступные списки', {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: listItems.map((item: IListDocument) => ([{
                            text: `${item.name} ▶`,
                            callback_data: JSON.stringify({type: ACTION_TYPE.FIND_LIST, id: item.id})
                        }]))
                    }
                })
            }
        })
    }
}

function getList(listId: string, chatId: number) {
    const listQuery = listDbService.getList(listId, chatId);
    if (listQuery) {
        listQuery.then((listItem: IListDocument) => {
            if (listItem) {
                const products = listItem.products.map((l, i) => {
                    return `${i + 1}. ${listItem.products[i]}`
                }).join('\n');
                bot.sendMessage(chatId, `Список <b>"${listItem.name}"</b>\n${products}`, {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: '➖ Удалить список',
                                    callback_data: JSON.stringify({type: ACTION_TYPE.DELETE_LIST, name: listItem.name})
                                }
                            ]
                        ]
                    }
                })
            }
        })
    }
}

async function addList(chatId: number, listName: string, products: string[]): Promise<void> {
    let listItem = await listDbService.addList(chatId, listName, products);
    if (listItem) {
        bot.sendMessage(chatId, `Список <b>"${listName}"</b>`, {
            parse_mode: 'HTML',
            reply_markup: {keyboard: keyboard.home}
        })
    }

}

async function delList(chatId: number, listName: string) {
    let listItem = await listDbService.delList(chatId, listName);
    if (listItem) {
        bot.sendMessage(chatId, `Список <b>"${listName}"</b> удален.`, {
            parse_mode: 'HTML'
        })
    }
}

function addNewList(chatId: number) {
    const products = 'Введите продукты, которые хотите добавить в список.\n' +
        '\nЧтобы добавить несколько товаров, введи их в одну строку, через запятую, например:\n' +
        '\nХлеб, чай, кофе, макароны'
    bot.sendMessage(chatId, 'Введите название списка:', {
        reply_markup: {remove_keyboard: true}
    }).then(() => {
        bot.once('text', (msg: Message) => {
                const listName = msg.text;
                if (listName)
                   bot.sendMessage(chatId, products).then(() => {
                       bot.once('text', (msg: Message) => {
                           const products = msg.text;
                           if (products) {
                               addList(chatId, listName, products.split(',').map(product => product.trim()));
                        }
                    });
                })
        })
    })
}
