
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CarForm } from '@/components/car-form';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

async function getFilterOptions() {
  const supabase = createClient();
  const { data } = await supabase.from('filters').select('*').limit(1);
  const filters = data?.[0];
  return {
    brands: filters?.brands || [],
    models: filters?.models || {},
    years: filters?.years || [],
  };
}

interface SellCarPageProps {}

export default async function SellCarPage({}: SellCarPageProps) {
  const { brands, models } = await getFilterOptions();

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <CarForm brands={brands} models={models} />
      </main>
      <Footer />
    </>
  );
}
