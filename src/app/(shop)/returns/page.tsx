import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Возврат и обмен — АЛТЕХ',
};

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-[var(--container-padding)] py-8 md:py-14">
      <h1 className="font-display text-2xl md:text-3xl text-text-primary mb-8">
        Политика возврата и обмена
      </h1>

      <div className="prose-legal space-y-6 text-sm text-text-secondary leading-relaxed">
        <p className="text-text-muted text-xs">
          Дата публикации: 1 марта 2026 г. &middot; Последнее обновление: 1 марта 2026 г.
        </p>

        <div className="rounded-xl border border-accent-yellow/20 bg-accent-yellow/5 p-5">
          <p className="text-sm text-text-primary">
            Возврат и обмен товаров осуществляется в соответствии с Законом РФ &laquo;О защите прав
            потребителей&raquo; от 07.02.1992 N&nbsp;2300-1 и Правилами продажи товаров дистанционным
            способом (Постановление Правительства РФ от 31.12.2020 N&nbsp;2463).
          </p>
        </div>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">1. Возврат товара надлежащего качества</h2>
          <p>
            Покупатель вправе отказаться от товара в любое время до его получения, а после
            получения — в течение <span className="text-text-primary font-semibold">7 (семи) дней</span> с
            момента передачи товара (ст.&nbsp;26.1 ЗоЗПП).
          </p>
          <p className="mt-2">Условия возврата:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Товар не был в употреблении, сохранены его товарный вид и потребительские свойства</li>
            <li>Сохранена оригинальная упаковка и маркировка</li>
            <li>Имеется документ, подтверждающий покупку (номер заказа, чек)</li>
          </ul>
          <p className="mt-2">
            Возврат денежных средств осуществляется в течение 10 дней с момента предъявления
            требования тем же способом, которым была произведена оплата.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">2. Возврат товара ненадлежащего качества</h2>
          <p>
            При обнаружении недостатков товара Покупатель вправе по своему выбору потребовать
            (ст.&nbsp;18 ЗоЗПП):
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Замены на аналогичный товар надлежащего качества</li>
            <li>Замены на другой товар с перерасчётом стоимости</li>
            <li>Соразмерного уменьшения покупной цены</li>
            <li>Возврата уплаченной денежной суммы</li>
          </ul>
          <p className="mt-2">
            Требование о возврате может быть предъявлено в течение гарантийного срока
            или срока годности товара.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">3. Товары, не подлежащие возврату</h2>
          <p>
            В соответствии с Постановлением Правительства РФ от 31.12.2020 N&nbsp;2463
            не подлежат возврату товары надлежащего качества:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Товары с нарушенной оригинальной упаковкой (вскрытые канистры, бочки)</li>
            <li>Товары, отпущенные на розлив (по объёму, указанному Покупателем)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">4. Порядок оформления возврата</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Свяжитесь с нами по телефону{' '}
              <a href="tel:+79969142832" className="text-accent-cyan hover:underline">+7 (996) 914-28-32</a>{' '}
              или email{' '}
              <a href="mailto:Alltech.dv@gmail.com" className="text-accent-cyan hover:underline">Alltech.dv@gmail.com</a>{' '}
              с указанием номера заказа и причины возврата
            </li>
            <li>Дождитесь подтверждения и инструкций по возврату товара</li>
            <li>Отправьте товар в оригинальной упаковке по указанному адресу</li>
            <li>Возврат средств осуществляется в течение 10 рабочих дней после получения товара Продавцом</li>
          </ol>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">5. Возврат денежных средств</h2>
          <p>
            Денежные средства возвращаются тем же способом, которым была произведена оплата:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Банковская карта — возврат на карту в течение 10 рабочих дней</li>
            <li>СБП — возврат на счёт в течение 10 рабочих дней</li>
            <li>Наличные — возврат при обращении по адресу Продавца</li>
          </ul>
          <p className="mt-2">
            Стоимость доставки при возврате товара надлежащего качества оплачивается Покупателем.
            При возврате товара ненадлежащего качества все расходы несёт Продавец.
          </p>
        </section>

        <section>
          <h2 className="font-display text-base text-text-primary mb-3">6. Контакты</h2>
          <p>
            ООО &laquo;АЛТЕХ&raquo;<br />
            Телефон: <a href="tel:+79969142832" className="text-accent-cyan hover:underline">+7 (996) 914-28-32</a><br />
            Email: <a href="mailto:Alltech.dv@gmail.com" className="text-accent-cyan hover:underline">Alltech.dv@gmail.com</a><br />
            Адрес: Респ. Саха (Якутия), г. Якутск, ул. Лонгинова, 24/6, 2 этаж
          </p>
        </section>
      </div>

      <div className="mt-10 pt-6 border-t border-border-subtle flex gap-4 text-xs text-text-muted">
        <Link href="/privacy" className="hover:text-accent-cyan transition-colors">Конфиденциальность</Link>
        <Link href="/terms" className="hover:text-accent-cyan transition-colors">Пользовательское соглашение</Link>
        <Link href="/offer" className="hover:text-accent-cyan transition-colors">Публичная оферта</Link>
      </div>
    </div>
  );
}
