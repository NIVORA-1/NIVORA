const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const lines = env.split(/\r?\n/);
const vars = {};
lines.forEach(l => {
  const match = l.match(/^([^#=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    vars[match[1].trim()] = val;
  }
});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function test() {
  const f = await supabase.from('music_favorites').select('*').limit(1);
  console.log('music_favorites:', f.error ? f.error.message : 'EXISTS');
  const p = await supabase.from('music_playlists').select('*').limit(1);
  console.log('music_playlists:', p.error ? p.error.message : 'EXISTS');
  const r = await supabase.from('music_recently_played').select('*').limit(1);
  console.log('music_recently_played:', r.error ? r.error.message : 'EXISTS');
  const items = await supabase.from('music_playlist_items').select('*').limit(1);
  console.log('music_playlist_items:', items.error ? items.error.message : 'EXISTS');
}
test();
