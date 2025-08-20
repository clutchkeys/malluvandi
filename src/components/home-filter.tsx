
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface HomeFilterProps {
  brands: string[];
  models: { [key: string]: string[] };
  years: number[];
}

export function HomeFilter({ brands, models, years }: HomeFilterProps) {
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedRegYear, setSelectedRegYear] = useState('');

  const availableModels = useMemo(() => {
    if (selectedBrand) {
      return models[selectedBrand] || [];
    }
    return [];
  }, [selectedBrand, models]);
  
  const handleSearch = () => {
    const query = new URLSearchParams();
    if (selectedBrand) query.append('brand', selectedBrand);
    if (selectedModel) query.append('model', selectedModel);
    if (selectedYear) query.append('year', selectedYear);
    if (selectedRegYear) query.append('regyear', selectedRegYear);

    const scrollTarget = document.getElementById('listings-section');
    if (scrollTarget) {
      const url = `/#listings-section?${query.toString()}`;
      history.pushState(null, '', url);
      // Manually trigger a popstate event to make sure navigation listeners fire,
      // or directly call the filtering logic if it's exposed.
      // For simplicity here, we'll just scroll.
      scrollTarget.scrollIntoView({ behavior: 'smooth' });
    } else {
        router.push(`/?${query.toString()}#listings-section`);
    }
  };

  return (
    <section className="bg-secondary/30 py-8">
      <div className="container mx-auto px-4">
        <Card className="shadow-lg -mt-20 z-20 relative">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger><SelectValue placeholder="Select Brand" /></SelectTrigger>
                  <SelectContent>
                    {brands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium">Model</label>
                <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedBrand}>
                  <SelectTrigger><SelectValue placeholder="Select Model" /></SelectTrigger>
                  <SelectContent>
                    {availableModels.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium">Model Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
                <div className="space-y-2">
                 <label className="text-sm font-medium">Registration Year</label>
                <Select value={selectedRegYear} onValueChange={setSelectedRegYear}>
                  <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button size="lg" className="w-full" onClick={handleSearch}>
                <Search className="mr-2 h-5 w-5" /> Find My Car
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
