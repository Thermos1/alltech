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
    const { query, brand, viscosity } = body as {
      query?: string;
      brand?: string;
      viscosity?: string;
    };

    if (!query && !brand && !viscosity) {
      return NextResponse.json(
        { success: false, message: 'Укажите параметры поиска: query, brand или viscosity' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    let dbQuery = admin
      .from('products')
      .select(
        '*, brands(name, slug), product_variants(id, volume, unit, price, stock_qty)'
      )
      .eq('is_active', true)
      .limit(5);

    // Search by name (ILIKE)
    if (query) {
      dbQuery = dbQuery.ilike('name', `%${query}%`);
    }

    // Filter by brand slug
    if (brand) {
      // Look up brand id first
      const { data: brandData } = await admin
        .from('brands')
        .select('id')
        .eq('slug', brand.toLowerCase())
        .single();

      if (brandData) {
        dbQuery = dbQuery.eq('brand_id', brandData.id);
      } else {
        return NextResponse.json({
          success: true,
          message: `Бренд '${brand}' не найден в каталоге`,
          products: [],
        });
      }
    }

    // Filter by viscosity
    if (viscosity) {
      dbQuery = dbQuery.ilike('viscosity', `%${viscosity}%`);
    }

    const { data: products, error } = await dbQuery;

    if (error) {
      console.error('SIPmind search-products error:', error);
      return NextResponse.json(
        { success: false, message: 'Ошибка при поиске товаров' },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      const searchDesc = [
        query && `'${query}'`,
        brand && `бренд '${brand}'`,
        viscosity && `вязкость '${viscosity}'`,
      ]
        .filter(Boolean)
        .join(', ');

      return NextResponse.json({
        success: true,
        message: `Товары по запросу ${searchDesc} не найдены`,
        products: [],
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedProducts = products.map((product: any) => {
      const brandObj = product.brands as { name: string; slug: string } | null;
      const variants = (product.product_variants ?? [])
        .filter((v: { price: number }) => v.price > 0)
        .sort((a: { price: number }, b: { price: number }) => a.price - b.price);

      const prices = variants.map((v: { price: number }) => v.price);
      const minPrice = prices.length > 0 ? Math.min(...prices) : null;

      return {
        name: product.name,
        slug: product.slug,
        brand: brandObj?.name ?? null,
        viscosity: product.viscosity ?? null,
        base_type: product.base_type ?? null,
        min_price: minPrice,
        variants: variants.map((v: { volume: string; unit: string; price: number }) => ({
          volume: v.volume,
          unit: v.unit,
          price: v.price,
        })),
      };
    });

    const searchDesc = [
      query && `'${query}'`,
      brand && `бренд '${brand}'`,
      viscosity && `вязкость '${viscosity}'`,
    ]
      .filter(Boolean)
      .join(', ');

    return NextResponse.json({
      success: true,
      message: `Найдено ${formattedProducts.length} товар(ов) по запросу ${searchDesc}`,
      products: formattedProducts,
    });
  } catch (error) {
    console.error('SIPmind search-products error:', error);
    return NextResponse.json(
      { success: false, message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
