import { useEffect, useState } from 'react';
import { api } from '@/lib/mock-api';
import { MockCountry } from '@/lib/mock-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CountrySelector = ({
  value,
  onChange,
  placeholder = 'Select a country',
}: CountrySelectorProps) => {
  const [countries, setCountries] = useState<MockCountry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      const { data } = await api.getCountries();
      setCountries(data);
      setLoading(false);
    };

    fetchCountries();
  }, []);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-card border-border">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Countries</SelectItem>
        {countries.map((country) => (
          <SelectItem key={country.id} value={country.name}>
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
