import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Публичная оферта — АЛТЕХ',
};

export default function OfferPage() {
  return (
    <div className="mx-auto max-w-3xl px-[var(--container-padding)] py-8 md:py-14">
      <h1 className="font-display text-2xl md:text-3xl text-text-primary mb-8">
        Публичная оферта
      </h1>

      <div className="prose-legal space-y-6 text-sm text-text-secondary leading-relaxed">
        <p className="text-text-muted text-xs">
          Дата публикации: 1 марта 2026 г. &middot; Последнее обновление: 1 марта 2026 г.
        </p>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">1. Общие положения</h2>
          <p>
            Настоящий документ является официальным предложением (публичной офертой)
            ООО &laquo;АЛТЕХ&raquo; (далее — Продавец) в адрес любого физического или юридического
            лица (далее — Покупатель) заключить договор купли-продажи товаров дистанционным
            способом на условиях, изложенных ниже.
          </p>
          <p className="mt-2">
            В соответствии со ст.&nbsp;437 Гражданского кодекса Российской Федерации данный документ
            является публичной офертой. Акцептом оферты является оформление заказа на сайте
            Продавца.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">2. Предмет договора</h2>
          <p>
            Продавец обязуется передать Покупателю товары из каталога интернет-магазина АЛТЕХ
            (altehspec.ru), а Покупатель обязуется принять и оплатить товары в порядке
            и на условиях, определённых настоящей офертой.
          </p>
          <p className="mt-2">
            Ассортимент товаров: смазочные материалы, фильтрующие элементы и сопутствующие товары
            для обслуживания автомобильной и специальной техники.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">3. Оформление заказа</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Покупатель самостоятельно выбирает товары на сайте и добавляет их в корзину</li>
            <li>При оформлении заказа Покупатель указывает контактные данные и адрес доставки</li>
            <li>После оформления заказа Покупатель получает подтверждение с номером заказа</li>
            <li>Продавец вправе связаться с Покупателем для уточнения деталей заказа</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">4. Цены и оплата</h2>
          <p>
            Цены на товары указаны на сайте в российских рублях и включают НДС (при применимости).
            Продавец оставляет за собой право изменять цены в одностороннем порядке. Цена товара,
            зафиксированная в момент оформления заказа, изменению не подлежит.
          </p>
          <p className="mt-2">Способы оплаты:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Банковские карты (Visa, Mastercard, МИР)</li>
            <li>Система быстрых платежей (СБП)</li>
            <li>Безналичный расчёт для юридических лиц (по счёту)</li>
            <li>Наличный расчёт при самовывозе</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">5. Доставка</h2>
          <p>
            Доставка осуществляется по адресу, указанному Покупателем при оформлении заказа.
            Сроки и стоимость доставки зависят от региона и объёма заказа и сообщаются
            Покупателю при подтверждении заказа.
          </p>
          <p className="mt-2">
            Самовывоз доступен по адресу: Респ. Саха (Якутия), г. Якутск,
            ул. Лонгинова, 24/6, 2 этаж. Часы работы: пн–пт 09:00–18:00.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">6. Качество товара</h2>
          <p>
            Продавец гарантирует, что все товары являются оригинальной продукцией,
            имеют необходимые сертификаты соответствия и не нарушают сроков годности.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">7. Возврат и обмен</h2>
          <p>
            Возврат и обмен товаров осуществляется в соответствии с Законом РФ
            &laquo;О защите прав потребителей&raquo; от 07.02.1992 N&nbsp;2300-1
            и <Link href="/returns" className="text-accent-cyan hover:underline">Политикой возврата</Link>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">8. Бонусная программа</h2>
          <p>
            Продавец предоставляет программу лояльности с начислением бонусных баллов
            за покупки. Условия программы, включая уровни и процент начисления, публикуются
            на сайте и могут быть изменены Продавцом с уведомлением Покупателей.
            Бонусные баллы не являются денежными средствами и не подлежат обналичиванию.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">9. Ответственность сторон</h2>
          <p>
            Стороны несут ответственность в соответствии с законодательством Российской Федерации.
            Продавец не несёт ответственности за ненадлежащее использование товаров Покупателем.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">10. Порядок разрешения споров</h2>
          <p>
            Все споры разрешаются путём переговоров. При невозможности достижения согласия
            спор передаётся на рассмотрение в суд по месту нахождения Продавца в соответствии
            с действующим законодательством РФ.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">11. Реквизиты Продавца</h2>
          <p>
            ООО &laquo;АЛТЕХ&raquo;<br />
            ОГРН: 1221400010182, ИНН: 1400013380, КПП: 140001001<br />
            Адрес: Респ. Саха (Якутия), г. Якутск, ул. Лонгинова, 24/6, 2 этаж<br />
            Телефон: <a href="tel:+79142744420" className="text-accent-cyan hover:underline">+7 (914) 274-44-20</a><br />
            Email: <a href="mailto:Alltech.dv@gmail.com" className="text-accent-cyan hover:underline">Alltech.dv@gmail.com</a>
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-border-subtle flex gap-4 text-xs text-text-muted">
        <Link href="/privacy" className="hover:text-accent-cyan transition-colors">Конфиденциальность</Link>
        <Link href="/terms" className="hover:text-accent-cyan transition-colors">Пользовательское соглашение</Link>
        <Link href="/returns" className="hover:text-accent-cyan transition-colors">Возврат и обмен</Link>
      </div>
    </div>
  );
}
