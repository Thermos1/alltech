import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifySipmindAuth } from '@/lib/sipmind/auth';

export async function POST(request: NextRequest) {
  try {
    if (!verifySipmindAuth(request)) {
      return NextResponse.json(
        { success: false, message: 'Неавторизованный запрос' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { product_slug, query } = body as {
      product_slug?: string;
      query?: string;
    };

    if (!product_slug && !query) {
      return NextResponse.json(
        { success: false, message: 'Укажите product_slug или query для проверки наличия' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Find product by slug or search by name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let product: any = null;

    if (product_slug) {
      const { data, error } = await admin
        .from('products')
        .select('id, name, slug, brands(name)')
        .eq('slug', product_slug)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return NextResponse.json({
          success: false,
          message: `Товар '${product_slug}' не найден в каталоге`,
        }, { status: 404 });
      }
      product = data;
    } else if (query) {
      // Search by name, take best match
      const { data, error } = await admin
        .from('products')
        .select('id, name, slug, brands(name)')
        .ilike('name', `%${query}%`)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error || !data) {
        return NextResponse.json({
          success: true,
          message: `Товар по запросу '${query}' не найден`,
          product_name: null,
          in_stock: false,
          variants: [],
        });
      }
      product = data;
    }

    // Fetch variants with stock info
    const { data: variants, error: variantsError } = await admin
      .from('product_variants')
      .select('id, volume, unit, price, stock_qty')
      .eq('product_id', product.id)
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (variantsError) {
      console.error('SIPmind check-stock variants error:', variantsError);
      return NextResponse.json(
        { success: false, message: 'Ошибка при проверке наличия' },
        { status: 500 }
      );
    }

    const formattedVariants = (variants ?? []).map(
      (v: { id: string; volume: string; unit: string; price: number; stock_qty: number }) => ({
        id: v.id,
        volume: v.volume,
        unit: v.unit,
        price: v.price,
        stock_qty: v.stock_qty ?? 0,
      })
    );

    const hasStock = formattedVariants.some(
      (v: { stock_qty: number }) => v.stock_qty > 0
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brandObj = product.brands as any;
    const brandName = brandObj?.name ?? '';
    const productFullName = brandName
      ? `${brandName} ${product.name}`
      : product.name;

    // Build Russian-language stock description
    let stockMessage: string;
    if (!variants || variants.length === 0) {
      stockMessage = `${productFullName} — нет доступных вариантов.`;
    } else if (hasStock) {
      const inStockVariants = formattedVariants
        .filter((v: { stock_qty: number }) => v.stock_qty > 0)
        .map(
          (v: { volume: string; unit: string; price: number; stock_qty: number }) =>
            `${v.volume} ${v.unit} — ${v.price} руб. (${v.stock_qty} шт.)`
        );
      stockMessage = `${productFullName} в наличии: ${inStockVariants.join('; ')}.`;
    } else {
      stockMessage = `${productFullName} — временно нет в наличии. Можно оформить предзаказ.`;
    }

    return NextResponse.json({
      success: true,
      message: stockMessage,
      product_name: productFullName,
      in_stock: hasStock,
      variants: formattedVariants,
    });
  } catch (error) {
    console.error('SIPmind check-stock error:', error);
    return NextResponse.json(
      { success: false, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
