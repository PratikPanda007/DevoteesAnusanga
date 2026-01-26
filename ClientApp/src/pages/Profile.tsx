import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CountrySelector } from '@/components/directory/CountrySelector';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/mock-api';
import { toast } from 'sonner';
import { z } from 'zod';
import { Save, Loader2, User, MapPin, Mail, Phone, Globe, Link as LinkIcon, Camera, Trash2, EyeOff } from 'lucide-react';
import ChangePasswordSection from '@/components/profile/ChangePasswordSection';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const profileSchema = z.object({
  name: z.string().trim().max(100).optional().or(z.literal('')),
  country: z.string().min(1, 'Country is required'),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  mission_description: z.string().max(1000).optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  linkedin: z.string().url('Invalid URL').optional().or(z.literal('')),
  facebook: z.string().url('Invalid URL').optional().or(z.literal('')),
  instagram: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const Profile = () => {
    const { user, profile, hasProfile, loading: authLoading, signOut, refreshProfile } = useAuth();

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNameConfirm, setShowNameConfirm] = useState(false);
  const [deleteNameInput, setDeleteNameInput] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [isProfileDisabled, setIsProfileDisabled] = useState(false);
  const [togglingDisabled, setTogglingDisabled] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    email: '',
    phone: '',
    mission_description: '',
    website: '',
    linkedin: '',
    facebook: '',
    instagram: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (!profile) return;

        let socialLinks: {
            website?: string;
            linkedin?: string;
            facebook?: string;
            instagram?: string;
        } = {};

        // 🔹 socialLinks comes as STRING → parse it
        if (typeof profile.socialLinks === 'string') {
            try {
                socialLinks = JSON.parse(profile.socialLinks);
            } catch (err) {
                console.error('Failed to parse socialLinks', err);
            }
        } else if (typeof profile.socialLinks === 'object' && profile.socialLinks !== null) {
            socialLinks = profile.socialLinks;
        }

        setAvatarUrl(profile.avatarUrl ?? null);
        setIsProfileDisabled(profile.isPublic === false);

        setFormData({
            name: profile.name ?? '',
            country: profile.country ?? '',
            city: profile.city ?? '',
            email: profile.email ?? '',
            phone: profile.phone ?? '',
            mission_description: profile.missionDescription ?? '',
            website: socialLinks.website ?? '',
            linkedin: socialLinks.linkedin ?? '',
            facebook: socialLinks.facebook ?? '',
            instagram: socialLinks.instagram ?? '',
        });
    }, [profile]);

    const fetchProfile = async () => {
        if (!user) return;

        // 🔹 If profile already exists from AuthContext → do NOTHING
        if (hasProfile && profile) {
            setLoading(false);
            return;
        }

        // 🔹 Only fetch if profile does NOT exist
        const { data } = await api.getProfileByUserId(user.id);

        if (data) {
            setAvatarUrl(data.avatar_url || null);
            setIsProfileDisabled(data.is_public === false);

            const socialLinks = data.social_links || {};
            setFormData({
                name: data.name || '',
                country: data.country || '',
                city: data.city || '',
                email: data.email || '',
                phone: data.phone || '',
                mission_description: data.mission_description || '',
                website: socialLinks.website || '',
                linkedin: socialLinks.linkedin || '',
                facebook: socialLinks.facebook || '',
                instagram: socialLinks.instagram || '',
            });
        }

        setLoading(false);
    };


  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const result = profileSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    
    setErrors({});
    return true;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      const { url } = await api.uploadAvatar(user.id, file);
      setAvatarUrl(url);
      toast.success('Profile picture updated!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    if (!validateForm()) {
      toast.error('Please fix the errors before saving.');
      return;
    }

    setSaving(true);

    const socialLinks = {
      website: formData.website || null,
      linkedin: formData.linkedin || null,
      facebook: formData.facebook || null,
      instagram: formData.instagram || null,
    };

    const profileData = {
      user_id: user.id,
      name: formData.name.trim() || null,
      country: formData.country,
      city: formData.city.trim() || null,
      email: formData.email || null,
      phone: formData.phone || null,
      mission_description: formData.mission_description || null,
      social_links: socialLinks,
      avatar_url: avatarUrl,
    };

    if (hasProfile) {
      await api.updateProfile(user.id, profileData);
    } else {
      await api.createProfile(profileData);
    }

    setHasProfile(true);
    await refreshProfile();
    toast.success('Profile saved successfully!');

    setSaving(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setShowNameConfirm(true);
    setDeleteNameInput('');
  };

  const handleFinalDelete = async () => {
    if (deleteNameInput.trim().toLowerCase() !== formData.name.trim().toLowerCase()) {
      toast.error('Name does not match. Please enter your exact name.');
      return;
    }

    if (!user) return;

    setDeleting(true);

    try {
      await api.deleteProfileByUserId(user.id);
      toast.success('Your account has been deleted.');
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setDeleting(false);
      setShowNameConfirm(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-2">
              {hasProfile ? 'Edit Your Profile' : 'Create Your Profile'}
            </h1>
            <p className="text-muted-foreground">
              {hasProfile
                ? 'Update your information to keep your profile current.'
                : 'Set up your profile to appear in the directory.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <Card className="elevated-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Profile Picture
                </CardTitle>
                <CardDescription>
                  Upload a photo for your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl || undefined} alt={formData.name} />
                      <AvatarFallback className="text-2xl">
                        {formData.name.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {uploadingAvatar && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? 'Uploading...' : 'Choose Photo'}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG or WebP. Max 2MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card className="elevated-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Your name and location for the directory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                    <Input
                        id="name"
                        value={user?.name || ''}
                        disabled
                        className="bg-muted cursor-not-allowed"
                    />
                  <p className="text-xs text-muted-foreground">
                    This is the name you registered with and cannot be changed
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Country *</Label>
                    <CountrySelector
                      value={formData.country}
                      onChange={(value) => handleChange('country', value)}
                      placeholder="Select country"
                    />
                    {errors.country && <p className="text-sm text-destructive">{errors.country}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="Your city (optional)"
                    />
                    {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="elevated-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Optional contact details visible to other members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="registered-email">Registered Email</Label>
                  <Input
                    id="registered-email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    This is your account email and cannot be changed
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="Alternative contact email"
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+1 234 567 8900"
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="elevated-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-primary" />
                  Social Links
                </CardTitle>
                <CardDescription>
                  Add your website and social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                  {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={(e) => handleChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.facebook}
                      onChange={(e) => handleChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => handleChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mission */}
            <Card className="elevated-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Your Mission
                </CardTitle>
                <CardDescription>
                  Describe your spiritual work, projects, or mission
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={formData.mission_description}
                  onChange={(e) => handleChange('mission_description', e.target.value)}
                  placeholder="Share what you're working on, your spiritual practice, or how you'd like to connect with others..."
                  rows={5}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.mission_description.length}/1000 characters
                </p>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {hasProfile ? 'Save Changes' : 'Create Profile'}
                </>
              )}
            </Button>

            {/* Change Password */}
            {hasProfile && <ChangePasswordSection />}

            {/* Disable Profile */}
            {hasProfile && (
              <Card className="elevated-card border-muted">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Hide from Directory</p>
                        <p className="text-sm text-muted-foreground">
                          Your profile won't appear in the public directory when disabled
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isProfileDisabled}
                      onCheckedChange={async (checked) => {
                        if (!user) return;
                        setTogglingDisabled(true);
                        try {
                          await api.updateProfile(user.id, { is_public: !checked });
                          setIsProfileDisabled(checked);
                          await refreshProfile();
                          toast.success(checked ? 'Profile hidden from directory' : 'Profile visible in directory');
                        } catch (error) {
                          toast.error('Failed to update visibility');
                        } finally {
                          setTogglingDisabled(false);
                        }
                      }}
                      disabled={togglingDisabled}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delete Account */}
            {hasProfile && (
              <Card className="elevated-card border-destructive/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-destructive">Delete Account</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your profile and all associated data
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteClick}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>
      </div>

      {/* First Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your profile and all associated data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Name Confirmation Dialog */}
      <AlertDialog open={showNameConfirm} onOpenChange={setShowNameConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Please type your name <span className="font-semibold text-foreground">"{formData.name}"</span> to confirm deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={deleteNameInput}
              onChange={(e) => setDeleteNameInput(e.target.value)}
              placeholder="Enter your name"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleFinalDelete}
              disabled={deleting || deleteNameInput.trim().toLowerCase() !== formData.name.trim().toLowerCase()}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Account'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Profile;
