
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SellCarForm } from '@/components/sell-car-form';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

async function getFilterOptions() {
  const supabase = createClient();
  const { data } = await supabase.from('filters').select('*').single();
  return {
    brands: data?.brands || [],
    models: data?.models || {},
    years: data?.years || [],
  };
}


export default async function SellCarPage() {
  const { brands, models } = await getFilterOptions();

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <SellCarForm brands={brands} models={models} />
      </main>
      <Footer />
    </>
  );
}
