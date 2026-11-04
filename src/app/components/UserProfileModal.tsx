import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Shield, 
  Bell, 
  AlertTriangle, 
  Users, 
  Save,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileModal({ open, onOpenChange }: UserProfileModalProps) {
  const { user, updateProfile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    organization: user?.organization || '',
    preferences: {
      notifications: user?.preferences?.notifications || true,
      emergencyAlerts: user?.preferences?.emergencyAlerts || true,
      volunteerUpdates: user?.preferences?.volunteerUpdates || false
    }
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    const result = await updateProfile({
      name: formData.name,
      phone: formData.phone,
      organization: formData.organization,
      preferences: formData.preferences
    });

    if (result.success) {
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to update profile');
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    onOpenChange(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'volunteer':
        return 'bg-blue-100 text-blue-800';
      case 'ngo':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'volunteer':
        return <Users className="w-4 h-4" />;
      case 'ngo':
        return <Building className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile information and preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info Section */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{user.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-3 h-3" />
                {user.email}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${getRoleColor(user.role)} flex items-center gap-1`}>
                  {getRoleIcon(user.role)}
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {user.status}
                </Badge>
              </div>
            </div>
          </div>

          {(error || success) && (
            <Alert variant={error ? "destructive" : "default"}>
              <AlertDescription>{error || success}</AlertDescription>
            </Alert>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            {(user.role === 'ngo' || user.organization) && (
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  placeholder="Organization name"
                  value={formData.organization}
                  onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                />
              </div>
            )}

            <Separator />

            {/* Preferences Section */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notification Preferences
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="general-notifications">General Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      System updates and general information
                    </p>
                  </div>
                  <Switch
                    id="general-notifications"
                    checked={formData.preferences.notifications}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, notifications: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emergency-alerts" className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                      Emergency Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Critical emergency notifications and updates
                    </p>
                  </div>
                  <Switch
                    id="emergency-alerts"
                    checked={formData.preferences.emergencyAlerts}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, emergencyAlerts: checked }
                      }))
                    }
                  />
                </div>

                {user.role === 'volunteer' && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="volunteer-updates" className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-500" />
                        Volunteer Updates
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Task assignments and volunteer coordination
                      </p>
                    </div>
                    <Switch
                      id="volunteer-updates"
                      checked={formData.preferences.volunteerUpdates}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, volunteerUpdates: checked }
                        }))
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}