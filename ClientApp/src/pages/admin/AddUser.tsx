import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/mock-api';
import { MockCountry, MockRole } from '@/lib/mock-data';
import { toast } from 'sonner';
import { UserPlus, Loader2, Save } from 'lucide-react';

const AddUser = () => {
  const [countries, setCountries] = useState<MockCountry[]>([]);
  const [roles, setRoles] = useState<MockRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    role_id: 2, // Default to Devotee
    mission_description: '',
    is_public: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [countriesRes, rolesRes] = await Promise.all([
      api.getCountries(),
      api.getRoles(),
    ]);
    setCountries(countriesRes.data);
    setRoles(rolesRes.data);
    setLoading(false);
  };

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.country) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);

    try {
      // Generate a mock user_id for the new profile
      const userId = `user-${crypto.randomUUID()}`;
      
      await api.createProfile({
        ...formData,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      toast.success('User created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        role_id: 2,
        mission_description: '',
        is_public: true,
      });
    } catch (error) {
      toast.error('Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="h-8 w-8 text-primary" />
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              Add User
            </h1>
          </div>
          <p className="text-muted-foreground">
            Create a new user profile manually
          </p>
        </div>

        <Card className="elevated-card">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Fill in the details for the new user profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleChange('country', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="City name"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role_id.toString()}
                  onValueChange={(value) => handleChange('role_id', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mission Description */}
              <div className="space-y-2">
                <Label htmlFor="mission">Mission / Bio</Label>
                <Textarea
                  id="mission"
                  value={formData.mission_description}
                  onChange={(e) => handleChange('mission_description', e.target.value)}
                  placeholder="Brief description or mission statement..."
                  rows={4}
                />
              </div>

              {/* Public Profile */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_public">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Show this profile in the public directory
                  </p>
                </div>
                <Switch
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => handleChange('is_public', checked)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AddUser;
