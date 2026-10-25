const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local file not found');
  process.exit(1);
}

const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return acc;
  const [k, ...v] = trimmed.split('=');
  if (k && v.length) acc[k.trim()] = v.join('=').trim();
  return acc;
}, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceKey);
const supabaseAnon = createClient(supabaseUrl, anonKey);

const tables = [
  'people',
  'motors',
  'motor_services',
  'gold_prices',
  'gold_purchases',
  'zakat_accounts',
  'zakat_years',
  'zakat_balances',
];

async function runTest() {
  console.log(`Connecting to: ${supabaseUrl}\n`);
  console.log('--- Testing tables with service_role ---');
  let hasError = false;

  for (const table of tables) {
    const { data, error } = await supabaseAdmin.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ [${table}] Error: ${error.code} - ${error.message}`);
      if (error.hint) console.log(`   Hint: ${error.hint}`);
      hasError = true;
    } else {
      console.log(`✅ [${table}] OK (rows fetched: ${data.length})`);
    }
  }

  console.log('\n--- Testing public access (anon role) ---');
  // Anon can only read gold_prices according to RLS, others should return empty array or 0 rows (not 42501 permission denied)
  for (const table of tables) {
    const { data, error } = await supabaseAnon.from(table).select('*').limit(1);
    if (error) {
      if (error.code === '42501' && error.message.includes('permission denied')) {
        console.log(`❌ [${table}] Anon Role Missing Table Privilege: ${error.message}`);
        hasError = true;
      } else {
        console.log(`⚠️  [${table}] Anon error: ${error.message}`);
      }
    } else {
      console.log(`✅ [${table}] Anon accessible under RLS (rows: ${data.length})`);
    }
  }

  if (hasError) {
    console.log('\n⚠️  Table privileges missing! Run supabase/migrations/20261025000001_grant_permissions.sql in Supabase SQL Editor.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tables verified successfully!');
  }
}

runTest().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
