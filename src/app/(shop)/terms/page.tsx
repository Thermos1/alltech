import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Пользовательское соглашение — АЛТЕХ',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-[var(--container-padding)] py-8 md:py-14">
      <h1 className="font-display text-2xl md:text-3xl text-text-primary mb-8">
        Пользовательское соглашение
      </h1>

      <div className="prose-legal space-y-6 text-sm text-text-secondary leading-relaxed">
        <p className="text-text-muted text-xs">
          Дата публикации: 1 марта 2026 г. &middot; Последнее обновление: 1 марта 2026 г.
        </p>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">1. Общие положения</h2>
          <p>
            Настоящее Пользовательское соглашение (далее — Соглашение) регулирует отношения
            между ООО &laquo;АЛТЕХ&raquo; (далее — Администрация) и пользователем сети Интернет
            (далее — Пользователь), возникающие при использовании интернет-магазина АЛТЕХ,
            расположенного по адресу altehspec.ru (далее — Сайт).
          </p>
          <p className="mt-2">
            Использование Сайта означает полное и безоговорочное согласие Пользователя
            с настоящим Соглашением. В случае несогласия с условиями Соглашения Пользователь
            должен прекратить использование Сайта.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">2. Предмет соглашения</h2>
          <p>Администрация предоставляет Пользователю доступ к следующим функциям Сайта:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Просмотр каталога товаров, описаний и цен</li>
            <li>Оформление и оплата заказов дистанционным способом</li>
            <li>Использование личного кабинета: история заказов, бонусная программа, профиль</li>
            <li>Поиск товаров по каталогу</li>
            <li>Участие в программе лояльности и реферальной программе</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">3. Регистрация и авторизация</h2>
          <p>
            Для доступа к личному кабинету и оформления заказов необходима авторизация
            по номеру телефона с использованием одноразового SMS-кода.
          </p>
          <p className="mt-2">
            Пользователь обязуется предоставлять достоверные данные при авторизации
            и несёт ответственность за все действия, совершённые под его учётной записью.
          </p>
          <p className="mt-2">
            Пользователь обязуется не передавать доступ к своей учётной записи третьим лицам.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">4. Обязанности Пользователя</h2>
          <p>При использовании Сайта Пользователь обязуется:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Соблюдать положения настоящего Соглашения</li>
            <li>Не предпринимать действий, нарушающих работу Сайта</li>
            <li>Не использовать автоматизированные средства для доступа к Сайту без разрешения</li>
            <li>Предоставлять достоверную информацию при оформлении заказа</li>
            <li>Своевременно оплачивать оформленные заказы</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">5. Права Администрации</h2>
          <p>Администрация вправе:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Изменять функциональность Сайта без предварительного уведомления</li>
            <li>Приостановить или прекратить доступ Пользователя при нарушении Соглашения</li>
            <li>Изменять цены, ассортимент и условия программы лояльности</li>
            <li>Проводить профилактические работы с временным ограничением доступа</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">6. Интеллектуальная собственность</h2>
          <p>
            Все материалы Сайта (тексты, графика, логотипы, программный код, дизайн)
            являются интеллектуальной собственностью Администрации или её партнёров
            и защищены законодательством РФ об авторском праве.
          </p>
          <p className="mt-2">
            Использование материалов Сайта без письменного согласия Администрации запрещено.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">7. Ограничение ответственности</h2>
          <p>
            Сайт предоставляется &laquo;как есть&raquo;. Администрация не гарантирует бесперебойную
            работу Сайта и не несёт ответственности за технические сбои, вызванные действиями
            третьих лиц или обстоятельствами непреодолимой силы.
          </p>
          <p className="mt-2">
            Администрация не несёт ответственности за убытки, понесённые Пользователем в результате
            использования или невозможности использования Сайта.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">8. Персональные данные</h2>
          <p>
            Обработка персональных данных осуществляется в соответствии
            с <Link href="/privacy" className="text-accent-cyan hover:underline">Политикой конфиденциальности</Link>.
            Оформляя заказ, Пользователь даёт согласие на обработку персональных данных
            в объёме и порядке, указанных в Политике конфиденциальности.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">9. Изменение соглашения</h2>
          <p>
            Администрация вправе в одностороннем порядке изменять условия Соглашения.
            Новая редакция вступает в силу с момента публикации. Продолжение использования
            Сайта после изменения Соглашения означает принятие Пользователем новых условий.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">10. Применимое право</h2>
          <p>
            Настоящее Соглашение регулируется и толкуется в соответствии с законодательством
            Российской Федерации. Все споры разрешаются в порядке, установленном действующим
            законодательством РФ, по месту нахождения Администрации.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">11. Контакты</h2>
          <p>
            ООО &laquo;АЛТЕХ&raquo;<br />
            ОГРН: 1221400010182, ИНН: 1400013380<br />
            Адрес: Респ. Саха (Якутия), г. Якутск, ул. Феликса Кона, д. 1а, кв. 90<br />
            Телефон: <a href="tel:+79241716122" className="text-accent-cyan hover:underline">+7 (924) 171-61-22</a><br />
            Email: <a href="mailto:Alltech.dv@gmail.com" className="text-accent-cyan hover:underline">Alltech.dv@gmail.com</a>
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-border-subtle flex gap-4 text-xs text-text-muted">
        <Link href="/privacy" className="hover:text-accent-cyan transition-colors">Конфиденциальность</Link>
        <Link href="/offer" className="hover:text-accent-cyan transition-colors">Публичная оферта</Link>
        <Link href="/returns" className="hover:text-accent-cyan transition-colors">Возврат и обмен</Link>
      </div>
    </div>
  );
}
