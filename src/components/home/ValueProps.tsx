export default function ValueProps() {
  return (
    <section className="bg-bg-secondary py-10 md:py-14">
      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)]">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          <div className="flex flex-col">
            <span className="font-display text-2xl text-accent-yellow-text md:text-3xl">
              7+
            </span>
            <span className="mt-1 text-sm text-text-primary font-medium">
              брендов в каталоге
            </span>
            <span className="mt-0.5 text-xs text-text-muted">
              ROLF, KIXX, SINTEC и другие
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-display text-2xl text-accent-cyan md:text-3xl">
              35+
            </span>
            <span className="mt-1 text-sm text-text-primary font-medium">
              позиций масел и жидкостей
            </span>
            <span className="mt-0.5 text-xs text-text-muted">
              от 1 л до 200 л бочек
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-display text-2xl text-accent-yellow-text md:text-3xl">
              0 ₽
            </span>
            <span className="mt-1 text-sm text-text-primary font-medium">
              доставка по Якутску
            </span>
            <span className="mt-0.5 text-xs text-text-muted">
              на стоянку, объект или в мастерскую
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-display text-2xl text-accent-cyan md:text-3xl">
              5%
            </span>
            <span className="mt-1 text-sm text-text-primary font-medium">
              кэшбэк бонусами
            </span>
            <span className="mt-0.5 text-xs text-text-muted">
              с каждого оплаченного заказа
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
