import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, MapPin, Calendar, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserProfileDto {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string | null;
    country: string;
    city: string;
    missionDescription: string | null;
    avatarUrl: string | null;
    socialLinks: string | null;
    isPublic: boolean;
    roleId: number;
    agreedToTermsAt: string | null;
    createdAt: string;
    updatedAt: string;
}

interface Props {
    user: UserProfileDto | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const UserDetailDialog = ({ user, open, onOpenChange }: Props) => {
    if (!user) return null;

    let socialLinks: Record<string, string> | null = null;

    try {
        socialLinks = user.socialLinks
            ? JSON.parse(user.socialLinks)
            : null;
    } catch {
        socialLinks = null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <Avatar className="h-14 w-14">
                            <AvatarImage src={user.avatarUrl || undefined} />
                            <AvatarFallback>
                                {user.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div>
                            <div className="text-xl font-semibold">{user.name}</div>
                            <Badge variant={user.isPublic ? 'default' : 'secondary'}>
                                {user.isPublic ? 'Public' : 'Private'}
                            </Badge>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">

                    {/* Contact */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{user.email}</span>
                        </div>

                        {user.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{user.phone}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{user.city}, {user.country}</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Mission */}
                    {user.missionDescription && (
                        <>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground uppercase">
                                    Mission
                                </h4>
                                <p className="text-sm mt-1">
                                    {user.missionDescription}
                                </p>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Social Links */}
                    {socialLinks && Object.keys(socialLinks).length > 0 && (
                        <>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground uppercase">
                                    Social Links
                                </h4>

                                {Object.entries(socialLinks).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-3">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <a
                                            href={value}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline text-sm"
                                        >
                                            {key}
                                        </a>
                                    </div>
                                ))}
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Account Info */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                                Joined {formatDistanceToNow(new Date(user.createdAt), {
                                    addSuffix: true,
                                })}
                            </span>
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
};
