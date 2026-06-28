from telegram import KeyboardButton, ReplyKeyboardMarkup, WebAppInfo
from config import MINIAPP_URL


def main_menu():
    rows = [
        ["Дневник", "История"],
        ["Советы по сну", "Звуки"],
        ["Статистика", "Профиль"],
        ["Апноэ", "Фокус"],
        ["Лидерборд", "Помощь"],
    ]
    if MINIAPP_URL:
        rows.append([KeyboardButton("Открыть Orca", web_app=WebAppInfo(url=MINIAPP_URL))])
    return ReplyKeyboardMarkup(rows, resize_keyboard=True)


def scale_keyboard():
    return ReplyKeyboardMarkup([["1", "2", "3", "4", "5"], ["Отмена"]], resize_keyboard=True, one_time_keyboard=True)
