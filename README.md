# RIA Wiadomości Polska — польская версия новостного демо

Адаптивный макет новостного портала **на польском языке для жителей Польши**. Домен — **`pl.rian.com.ua`**. Заголовки и даты в HTML — **примеры оформления, не актуальная новостная лента**.

## Что изменилось по сравнению с v4 (украинской)

- Весь интерфейс и тексты переведены на польский: `lang="pl"`, `og:locale="pl_PL"`, логотип и фавикон («RIA Wiadomości Polska»), JS-сообщения рейтинга, комментариев, поиска и меню.
- Контент переписан с позиции местного читателя, а не «новостей о Польше для иностранцев»: «komunikacja miejska», gmina / powiat / województwo, budżet obywatelski, konsultacje społeczne, BIP и dane.gov.pl, komisje sejmowe.
- Польская типографика: кавычки „…”, неразрывный пробел после однобуквенных предлогов и союзов (w, z, i, o, a, u), даты «2 października 2026», локаль `pl-PL` в JS и польские формы множественного числа (1 głos / 2 głosy / 5 głosów).
- Шрифт Oswald: удалены кириллические файлы, добавлены `oswald-latin-ext-*.woff` с польскими буквами (ą ć ę ł ń ó ś ź ż).
- Добавлены `canonical` и `og:url` на `https://pl.rian.com.ua/…`; ссылки в шапке и подвале ведут на `pl.rian.com.ua`.
- В форму комментария добавлена короткая информация по RODO (GDPR).

## Рубрики

| Рубрика в меню | Ярлык WordPress |
| --- | --- |
| Polityka | `politics` |
| Gospodarka | `economy` |
| Społeczeństwo | `society` |
| Wydarzenia | `emergencies` |
| Kultura | `culture` |
| Sport | `sport` |
| Warszawa | `warsaw` |
| Świat | `world` |
| Infografiki | `infographics` |
| Wywiady | `interviews` |
| Reportaże | `reports` |

Отдельная страница рубрики в HTML-демо есть только для «Polityka» (две страницы с пагинацией); остальные пункты меню ведут к блокам главной.

## Публикация на GitHub Pages

1. Распакуйте архив и загрузите **содержимое** папки в корень репозитория (ветка `main`): `index.html`, `article.html`, `politics.html`, `politics-2.html`, `assets/`, `PHOTO_CREDITS.md`, `.nojekyll`. Старые файлы `assets/fonts/oswald-cyrillic-*.woff2` больше не используются — их можно удалить.
2. **Settings → Pages**: Deploy from a branch → `main` → `/(root)`.
3. **Чтобы сайт открывался по адресу `pl.rian.com.ua`:** у регистратора домена `rian.com.ua` добавьте DNS-запись `CNAME` для `pl` → `yuliaoliyar.github.io`, затем в **Settings → Pages → Custom domain** впишите `pl.rian.com.ua` и включите **Enforce HTTPS**. GitHub сам создаст файл `CNAME` в репозитории. До настройки DNS сайт продолжит работать по адресу `yuliaoliyar.github.io/rian/`.

## WordPress-тема

WordPress-тема (`rian-novyny-ukraina`) в этот архив не входит и пока остаётся украинской. Для польской редакции её строки нужно перевести отдельно; часовой пояс в WordPress — **Europe/Warsaw**, язык сайта — **Polski**.

## Источники и лицензии

Фотографии — [Pexels](https://www.pexels.com/license/), список авторов в [PHOTO_CREDITS.md](PHOTO_CREDITS.md) (на польском). Шрифт Oswald — SIL Open Font License, `assets/fonts/OFL-LICENSE.txt`. Перед запуском замените стоковые фото собственными кадрами редакции.
