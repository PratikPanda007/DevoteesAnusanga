import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { MemberCard } from '@/components/directory/MemberCard';
import { CountrySelector } from '@/components/directory/CountrySelector';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users, MapPin, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { getToken } from '@/lib/auth-api';
import api from '@/lib/http';

const PREVIEW_COUNT = 3;

/* ✅ REAL PROFILE TYPE (matches API response) */
type DirectoryProfile = {
    profileId: string;
    userId: string;

    name: string;
    email?: string;
    phone?: string;

    country: string;
    city?: string;

    missionDescription?: string;
    avatarUrl?: string;

    socialLinks?: {
        website?: string;
        linkedin?: string;
        facebook?: string;
        instagram?: string;
    };

    roleId: number;
};

const Directory = () => {
    const [profiles, setProfiles] = useState<DirectoryProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchProfiles();
    }, []);

    /* ✅ REAL API CALL */
    const fetchProfiles = async () => {
        setLoading(true);

        try {
            const res = await api.get('/api/active-directory');

            /* Axios already gives parsed JSON */
            const mapped: DirectoryProfile[] = res.data.map((p: any) => ({
                profileId: p.profileId,
                userId: p.userId,

                name: p.name,
                email: p.email,
                phone: p.phone,

                country: p.country,
                city: p.city,

                missionDescription: p.missionDescription,
                avatarUrl: p.avatarUrl,

                socialLinks: p.socialLinks
                    ? typeof p.socialLinks === 'string'
                        ? JSON.parse(p.socialLinks)
                        : p.socialLinks
                    : undefined,

                roleId: p.roleId,
            }));

            setProfiles(mapped);
        } catch (err) {
            console.error('Failed to fetch directory', err);
            setProfiles([]);
        } finally {
            setLoading(false);
        }
    };


    const toggleCityExpanded = (cityKey: string) => {
        setExpandedCities(prev => {
            const next = new Set(prev);
            next.has(cityKey) ? next.delete(cityKey) : next.add(cityKey);
            return next;
        });
    };

    /* ✅ Client-side filtering ONLY */
    const filteredProfiles = profiles.filter((profile) => {
        const query = searchQuery.toLowerCase();
        const locationLabel = profile.city || profile.country;

        if (selectedCountry !== 'all' && profile.country !== selectedCountry) {
            return false;
        }

        return (
            profile.name.toLowerCase().includes(query) ||
            locationLabel.toLowerCase().includes(query)
        );
    });

    /* Group by country → city */
    const groupedByCountryAndCity = filteredProfiles.reduce<Record<string, Record<string, DirectoryProfile[]>>>(
        (acc, profile) => {
            const country = profile.country;
            const city = profile.city || country;

            if (!acc[country]) acc[country] = {};
            if (!acc[country][city]) acc[country][city] = [];

            acc[country][city].push(profile);
            return acc;
        },
        {}
    );

    const sortedCountries = Object.keys(groupedByCountryAndCity).sort();

    const getSortedCitiesForCountry = (country: string) => {
        const cities = Object.keys(groupedByCountryAndCity[country]);
        return cities.sort((a, b) => {
            if (a === country) return -1;
            if (b === country) return 1;
            return a.localeCompare(b);
        });
    };

    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative py-16 md:py-20 gradient-subtle border-b border-border/50">
                <div className="container px-4 md:px-8">
                    <div className="max-w-2xl">
                        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
                            Global Directory
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Explore our worldwide network of verified members. Find connections by country and city.
                        </p>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border/50 py-4">
                <div className="container px-4 md:px-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full sm:w-64">
                            <CountrySelector
                                value={selectedCountry}
                                onChange={setSelectedCountry}
                                placeholder="Filter by country"
                            />
                        </div>
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search by name or city..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-card"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Results */}
            <section className="py-8 md:py-12">
                <div className="container px-4 md:px-8">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : sortedCountries.length === 0 ? (
                        <div className="text-center py-20">
                            <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                                No members found
                            </h3>
                            <p className="text-muted-foreground">
                                Be the first to join our community!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-16">
                            {sortedCountries.map((country) => (
                                <div key={country}>
                                    {selectedCountry === 'all' && (
                                        <h2 className="font-serif text-3xl font-semibold mb-8 border-b pb-3">
                                            {country}
                                        </h2>
                                    )}

                                    <div className="space-y-10">
                                        {getSortedCitiesForCountry(country).map((city) => {
                                            const cityKey = `${country}-${city}`;
                                            const cityMembers = groupedByCountryAndCity[country][city];
                                            const isExpanded = expandedCities.has(cityKey);
                                            const hasMore = cityMembers.length > PREVIEW_COUNT;

                                            const displayedMembers = isExpanded
                                                ? cityMembers
                                                : cityMembers.slice(0, PREVIEW_COUNT);

                                            return (
                                                <div key={city}>
                                                    <div className="flex items-center gap-2 mb-6">
                                                        <MapPin className="h-5 w-5 text-primary" />
                                                        <h3 className="font-serif text-2xl font-semibold">
                                                            {city}
                                                        </h3>
                                                        <span className="text-sm text-muted-foreground ml-2">
                                                            ({cityMembers.length} member{cityMembers.length !== 1 ? 's' : ''})
                                                        </span>
                                                    </div>

                                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {displayedMembers.map((profile) => (
                                                            <MemberCard
                                                                key={profile.profileId}
                                                                name={profile.name || 'Anonymous'}
                                                                city={profile.city || profile.country}
                                                                country={profile.country}
                                                                email={profile.email}
                                                                phone={profile.phone}
                                                                socialLinks={profile.socialLinks}
                                                                missionDescription={profile.missionDescription}
                                                                roleId={profile.roleId}
                                                                avatarUrl={profile.avatarUrl}
                                                            />
                                                        ))}
                                                    </div>

                                                    {hasMore && (
                                                        <div className="mt-6 text-center">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => toggleCityExpanded(cityKey)}
                                                                className="gap-2"
                                                            >
                                                                {isExpanded ? (
                                                                    <>
                                                                        <ChevronUp className="h-4 w-4" />
                                                                        Show less
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ChevronDown className="h-4 w-4" />
                                                                        View all {cityMembers.length - PREVIEW_COUNT} more
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
};

export default Directory;
