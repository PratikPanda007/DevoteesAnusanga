import { MockProfile } from '@/lib/mock-data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Eye,
  EyeOff,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserDetailDialogProps {
  user: MockProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailDialog = ({ user, open, onOpenChange }: UserDetailDialogProps) => {
  if (!user) return null;

  const socialLinks = user.social_links as Record<string, string> | null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-xl">{user.name || 'Unknown User'}</span>
              <Badge
                variant={user.is_public ? 'default' : 'secondary'}
                className="ml-2"
              >
                {user.is_public ? (
                  <><Eye className="h-3 w-3 mr-1" /> Public</>
                ) : (
                  <><EyeOff className="h-3 w-3 mr-1" /> Hidden</>
                )}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Contact Information
            </h4>
            
            {user.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
            )}
            
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{user.phone}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{user.city ? `${user.city}, ` : ''}{user.country}</span>
            </div>
          </div>

          <Separator />

          {/* Mission / Bio */}
          {user.mission_description && (
            <>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Mission / Bio
                </h4>
                <p className="text-sm">{user.mission_description}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Social Links */}
          {socialLinks && Object.keys(socialLinks).length > 0 && (
            <>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Social Links
                </h4>
                {Object.entries(socialLinks).map(([key, value]) => (
                  value && (
                    <div key={key} className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </a>
                    </div>
                  )
                ))}
              </div>
              <Separator />
            </>
          )}

          {/* Account Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Account Information
            </h4>
            
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">User ID: {user.user_id}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
