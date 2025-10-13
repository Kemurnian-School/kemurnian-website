import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export async function getSearchData() {
  const { data: searchData, error: searchDataError } = await supabase
    .from("search_index")
    .select("title, url");

  if (searchDataError) {
    console.error("Failed to fetch search data:", searchDataError);
  }

  return searchData;
}
