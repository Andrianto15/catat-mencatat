import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchLiveGaleri24Prices } from '@/lib/gold/scraper';

export async function GET(request: NextRequest) {
  // Authorization check for Vercel Cron or manual admin trigger
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role if available for cron upsert, or fallback to standard env
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'dummy-key';

  const supabase = createClient(supabaseUrl, supabaseKey);
  const todayStr = new Date().toISOString().split('T')[0];

  try {
    const parsedPrices = await fetchLiveGaleri24Prices();

    if (parsedPrices.length === 0) {
      // Record failure for today as per PRD review focus
      await supabase.from('gold_prices').upsert(
        {
          price_date: todayStr,
          brand: 'ANTAM',
          weight_gram: 1,
          sell_price: null,
          buyback_price: null,
          status: 'gagal',
        },
        { onConflict: 'price_date,brand,weight_gram' }
      );

      return NextResponse.json({
        success: false,
        message: 'No prices parsed. Fallback recorded with status gagal.',
      });
    }

    // Insert or update parsed prices
    const rows = parsedPrices.map((p) => ({
      price_date: todayStr,
      brand: p.brand,
      weight_gram: p.weight_gram,
      sell_price: p.sell_price,
      buyback_price: p.buyback_price,
      status: 'auto',
    }));

    const { error } = await supabase
      .from('gold_prices')
      .upsert(rows, { onConflict: 'price_date,brand,weight_gram' });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      syncedCount: rows.length,
      date: todayStr,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error syncing gold prices' },
      { status: 500 }
    );
  }
}
