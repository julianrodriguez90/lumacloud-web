import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.PUBLIC_SUPABASE_URL  ?? '';
const supabaseKey  = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type PseoPage = {
  id:          number;
  slug:        string;
  silo:        string;
  keyword:     string;
  ciudad?:     string;
  sector?:     string;
  content_md:  string;
  meta_title:  string;
  meta_desc:   string;
  published:   boolean;
  created_at:  string;
};
