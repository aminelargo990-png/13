import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ddzkdxdqwvlyshgzuacu.supabase.co';

const supabaseKey = 'sb_publishable_7Kg-Ka0jvpa3OGIYz1SayA_-lCfSbQC';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
