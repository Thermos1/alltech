import LoadSharedCart from './LoadSharedCart';

export const metadata = {
  title: 'Корзина от менеджера — АЛТЕХ',
};

export default async function SharedCartPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadSharedCart code={code} />
    </div>
  );
}
