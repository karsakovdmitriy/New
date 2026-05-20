export const translations = {
  ru: {
    common: {
      loading: "Загрузка...",
      save: "Сохранить",
      cancel: "Отмена",
      delete: "Удалить",
      back: "Назад",
    },
    auth: {
      login: "Войти",
      signup: "Зарегистрироваться",
      email: "Email",
      password: "Пароль",
      welcome: "Добро пожаловать",
    },
    workouts: {
      title: "Тренировки",
      available: "Доступные тренировки",
      create: "Создать тренировку",
      no_workouts: "Пока нет активных тренировок.",
      price: "Стоимость",
      trainer: "Тренер",
    },
    bookings: {
      book: "Записаться",
      success: "Успешная запись!",
      select_time: "Выберите подходящее время",
    }
  }
};

export type TranslationKey = typeof translations.ru;

export const t = translations.ru;
