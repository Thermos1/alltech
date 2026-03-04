import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — АЛТЕХ',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-[var(--container-padding)] py-8 md:py-14">
      <h1 className="font-display text-2xl md:text-3xl text-text-primary mb-8">
        Политика конфиденциальности
      </h1>

      <div className="prose-legal space-y-6 text-sm text-text-secondary leading-relaxed">
        <p className="text-text-muted text-xs">
          Дата публикации: 1 марта 2026 г. &middot; Последнее обновление: 1 марта 2026 г.
        </p>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">1. Общие положения</h2>
          <p>
            Настоящая Политика конфиденциальности (далее — Политика) определяет порядок обработки
            и защиты персональных данных пользователей (далее — Пользователи) интернет-магазина
            АЛТЕХ (далее — Оператор), расположенного по адресу{' '}
            <span className="text-accent-cyan">altehspec.ru</span>.
          </p>
          <p className="mt-2">
            Оператор персональных данных: ООО &laquo;АЛТЕХ&raquo;, ОГРН 1221400010182,
            ИНН 1400013380, юридический адрес: Респ. Саха (Якутия), г. Якутск,
            ул. Лонгинова, 24/6, 2 этаж.
          </p>
          <p className="mt-2">
            Политика разработана в соответствии с Федеральным законом от 27.07.2006
            N&nbsp;152-ФЗ &laquo;О персональных данных&raquo;, Федеральным законом от 27.07.2006
            N&nbsp;149-ФЗ &laquo;Об информации, информационных технологиях и о защите информации&raquo;,
            а также иными нормативными правовыми актами Российской Федерации.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">2. Какие данные мы собираем</h2>
          <p>В процессе использования сайта Оператор может обрабатывать следующие персональные данные:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Фамилия, имя, отчество</li>
            <li>Номер телефона</li>
            <li>Адрес электронной почты (для сотрудников)</li>
            <li>Адрес доставки</li>
            <li>Наименование юридического лица, ИНН (при наличии)</li>
            <li>История заказов и данные о покупках</li>
            <li>IP-адрес, тип и версия браузера, данные cookie-файлов</li>
            <li>Сведения о действиях Пользователя на сайте</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">3. Цели обработки данных</h2>
          <p>Персональные данные обрабатываются для:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Идентификации Пользователя и предоставления доступа к личному кабинету</li>
            <li>Оформления и исполнения заказов, включая доставку товаров</li>
            <li>Связи с Пользователем: уведомления о статусе заказа, ответы на обращения</li>
            <li>Начисления и учёта бонусов в рамках программы лояльности</li>
            <li>Улучшения качества обслуживания и работы сайта</li>
            <li>Исполнения требований законодательства Российской Федерации</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">4. Правовые основания обработки</h2>
          <p>Обработка персональных данных осуществляется на следующих основаниях:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Согласие Пользователя на обработку персональных данных (ст.&nbsp;6 ч.&nbsp;1 п.&nbsp;1 152-ФЗ)</li>
            <li>Исполнение договора, стороной которого является Пользователь (ст.&nbsp;6 ч.&nbsp;1 п.&nbsp;5 152-ФЗ)</li>
            <li>Исполнение обязанностей, возложенных на Оператора законодательством РФ</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">5. Хранение и защита данных</h2>
          <p>
            Персональные данные хранятся на защищённых серверах с использованием шифрования
            (TLS/SSL). Доступ к данным имеют только уполномоченные сотрудники Оператора.
          </p>
          <p className="mt-2">
            Оператор применяет организационные и технические меры для защиты персональных данных
            от несанкционированного доступа, уничтожения, изменения, блокирования, копирования,
            распространения, а также от иных неправомерных действий третьих лиц.
          </p>
          <p className="mt-2">
            Персональные данные хранятся не дольше, чем этого требуют цели обработки, если иное
            не предусмотрено требованиями законодательства.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">6. Передача данных третьим лицам</h2>
          <p>Оператор не продаёт и не передаёт персональные данные третьим лицам, за исключением:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Служб доставки — для исполнения заказа (ФИО, адрес, телефон)</li>
            <li>Платёжных систем — для обработки оплаты (данные передаются в зашифрованном виде)</li>
            <li>Государственных органов — по запросу в соответствии с законодательством РФ</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">7. Cookie-файлы</h2>
          <p>
            Сайт использует cookie-файлы для обеспечения корректной работы, авторизации
            Пользователей и улучшения качества обслуживания. Cookie-файлы не содержат
            персональных данных и не используются для идентификации Пользователя третьими лицами.
          </p>
          <p className="mt-2">
            Пользователь может отключить cookie-файлы в настройках браузера, однако это может
            повлиять на функциональность сайта.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">8. Права Пользователя</h2>
          <p>Пользователь имеет право:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Получить информацию об обработке своих персональных данных</li>
            <li>Потребовать уточнения, блокирования или уничтожения данных</li>
            <li>Отозвать согласие на обработку персональных данных</li>
            <li>Обжаловать действия Оператора в Роскомнадзор</li>
          </ul>
          <p className="mt-2">
            Для реализации своих прав Пользователь может обратиться по адресу электронной почты:{' '}
            <a href="mailto:Alltech.dv@gmail.com" className="text-accent-cyan hover:underline">
              Alltech.dv@gmail.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">9. Изменение Политики</h2>
          <p>
            Оператор вправе вносить изменения в настоящую Политику. Новая редакция вступает в силу
            с момента её размещения на сайте, если иное не предусмотрено новой редакцией.
            Продолжение использования сайта после внесения изменений означает согласие Пользователя
            с обновлённой Политикой.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">10. Контакты</h2>
          <p>
            ООО &laquo;АЛТЕХ&raquo;<br />
            ОГРН: 1221400010182, ИНН: 1400013380<br />
            Адрес: Респ. Саха (Якутия), г. Якутск, ул. Лонгинова, 24/6, 2 этаж<br />
            Телефон: <a href="tel:+79142744420" className="text-accent-cyan hover:underline">+7 (914) 274-44-20</a><br />
            Email: <a href="mailto:Alltech.dv@gmail.com" className="text-accent-cyan hover:underline">Alltech.dv@gmail.com</a>
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-border-subtle flex gap-4 text-xs text-text-muted">
        <Link href="/terms" className="hover:text-accent-cyan transition-colors">Пользовательское соглашение</Link>
        <Link href="/offer" className="hover:text-accent-cyan transition-colors">Публичная оферта</Link>
        <Link href="/returns" className="hover:text-accent-cyan transition-colors">Возврат и обмен</Link>
      </div>
    </div>
  );
}
