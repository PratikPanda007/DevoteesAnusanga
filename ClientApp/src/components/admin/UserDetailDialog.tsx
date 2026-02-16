import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, MapPin, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface UserListDto {
    id: string;
    email: string;
    name: string;
    userRoleID: number;
    roleName: string;
    city: string;
    country: string;
    hasProfile: number;
    isProfilePublic: number | null;
    isActive: boolean;
    created_At: string;
}

interface UserDetailDialogProps {
    user: UserListDto | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const UserDetailDialog = ({
    user,
    open,
    onOpenChange,
}: UserDetailDialogProps) => {
    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex flex-col">
                            <span className="text-xl font-semibold">
                                {user.name || 'Unknown User'}
                            </span>

                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{user.roleName}</Badge>

                                <Badge
                                    variant={
                                        user.isProfilePublic === 1 ? 'default' : 'secondary'
                                    }
                                >
                                    {user.isProfilePublic === 1 ? 'Public' : 'Hidden'}
                                </Badge>

                                <Badge
                                    variant={user.isActive ? 'default' : 'destructive'}
                                >
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* Contact Information */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Contact Information
                        </h4>

                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{user.email}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>
                                {user.city ? `${user.city}, ` : ''}
                                {user.country}
                            </span>
                        </div>
                    </div>

                    <Separator />

                    {/* Account Info */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Account Information
                        </h4>

                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">User ID: {user.id}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                                Joined{' '}
                                {formatDistanceToNow(new Date(user.created_At), {
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
