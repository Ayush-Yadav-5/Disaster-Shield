import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { 
  Users, 
  Heart, 
  Building2, 
  Shield, 
  Eye, 
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Lock,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { digiLockerService, type DigiLockerUser } from "../utils/digilocker-service";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: string;
}

const roleInfo = {
  citizen: {
    title: "Citizen",
    icon: Users,
    color: "text-blue-700",
    description: "Report incidents and access emergency services"
  },
  volunteer: {
    title: "Volunteer",
    icon: Heart,
    color: "text-green-700",
    description: "Join rescue operations and help communities"
  },
  ngo: {
    title: "NGO/Organization",
    icon: Building2,
    color: "text-purple-700",
    description: "Manage resources and coordinate relief efforts"
  },
  admin: {
    title: "Emergency Services",
    icon: Shield,
    color: "text-red-700",
    description: "Administrative access to manage operations"
  }
} as const;

// Helper function to validate and get role info with fallback
const getRoleInfo = (role: string) => {
  const validRoles = Object.keys(roleInfo);
  const validRole = validRoles.includes(role) ? role : 'citizen';
  return roleInfo[validRole as keyof typeof roleInfo];
};

export function AuthModal({ isOpen, onClose, defaultRole = "citizen" }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState("signin");
  
  // Ensure selectedRole is always valid
  const [selectedRole, setSelectedRole] = useState(() => {
    const validRoles = Object.keys(roleInfo);
    return validRoles.includes(defaultRole) ? defaultRole : 'citizen';
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [digiLockerLoading, setDigiLockerLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    organization: "",
    location: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(formData.email, formData.password);
      if (result.success) {
        toast.success("Successfully signed in!");
        onClose();
      } else {
        toast.error(result.error || "Failed to sign in");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      // Map the form data to match AuthContext expectations
      const userData = {
        name: formData.fullName, // AuthContext expects 'name', not 'fullName'
        role: selectedRole as 'citizen' | 'volunteer' | 'ngo' | 'admin',
        phone: formData.phone,
        organization: formData.organization,
      };

      const result = await signUp(formData.email, formData.password, userData);
      if (result.success) {
        toast.success("Account created successfully!");
        onClose();
      } else {
        toast.error(result.error || "Failed to create account");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
      organization: "",
      location: ""
    });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    resetForm();
  };

  const handleRoleChange = (role: string) => {
    const validRoles = Object.keys(roleInfo);
    if (validRoles.includes(role)) {
      setSelectedRole(role);
    }
  };

  // Handle DigiLocker authentication
  const handleDigiLockerAuth = async () => {
    setDigiLockerLoading(true);
    try {
      toast.info('Opening DigiLocker authentication...');
      const result = await digiLockerService.initiateAuth();
      
      if (result.success && result.user) {
        const digiUser = result.user;
        
        // Auto-fill form with DigiLocker data
        setFormData(prev => ({
          ...prev,
          fullName: digiUser.name,
          email: digiUser.email || prev.email,
          phone: digiUser.mobile || prev.phone,
        }));

        // Generate a random password for DigiLocker users
        const autoPassword = 'DL_' + Math.random().toString(36).substring(2, 15);
        setFormData(prev => ({
          ...prev,
          password: autoPassword,
          confirmPassword: autoPassword
        }));

        // Create account with DigiLocker verified data
        const userData = {
          name: digiUser.name,
          role: selectedRole as 'citizen' | 'volunteer' | 'ngo' | 'admin',
          phone: digiUser.mobile || '',
          email: digiUser.email || '',
          digiLockerVerified: true,
          eKYCCompleted: digiUser.eKYCCompleted,
          aadhaarLast4: digiUser.aadhaar
        };

        const email = digiUser.email || `${digiUser.mobile}@digilocker.temp`;
        const signUpResult = await signUp(email, autoPassword, userData);
        
        if (signUpResult.success) {
          toast.success(
            <div>
              <p className="font-semibold">✓ DigiLocker Verified!</p>
              <p className="text-sm">Your identity has been verified by Government of India</p>
            </div>,
            { duration: 5000 }
          );
          onClose();
        } else {
          toast.error(signUpResult.error || 'Failed to create account with DigiLocker');
        }
      }
    } catch (error: any) {
      console.error('DigiLocker auth error:', error);
      if (error.error) {
        toast.error(error.error);
      } else {
        toast.error('Failed to authenticate with DigiLocker. Please try again.');
      }
    } finally {
      setDigiLockerLoading(false);
    }
  };

  // Safely get current role info with fallback
  const currentRoleInfo = getRoleInfo(selectedRole);
  const RoleIcon = currentRoleInfo?.icon || Users;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <RoleIcon className={`w-5 h-5 ${currentRoleInfo?.color || 'text-blue-700'}`} />
            <span>Join as {currentRoleInfo?.title || 'User'}</span>
          </DialogTitle>
          <DialogDescription>
            Create an account or sign in to access disaster management features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <Label>Select Your Role</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(roleInfo).map(([key, role]) => {
                const Icon = role.icon;
                return (
                  <Button
                    key={key}
                    variant={selectedRole === key ? "default" : "outline"}
                    size="sm"
                    className="h-auto py-3 flex flex-col items-center space-y-1"
                    onClick={() => handleRoleChange(key)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{role.title}</span>
                  </Button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentRoleInfo?.description || 'Please select a role to continue'}
            </p>
          </div>

          {/* Auth Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup" className="space-y-4">
              {/* DigiLocker Sign Up Button */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
                  onClick={handleDigiLockerAuth}
                  disabled={digiLockerLoading}
                >
                  <div className="flex items-center justify-center gap-3">
                    {digiLockerLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 text-purple-600" />
                        <div className="flex flex-col items-start">
                          <span className="text-purple-900">Sign up with DigiLocker</span>
                          <span className="text-xs text-purple-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Instant verification with Aadhaar
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or sign up manually</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name *</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+91 9999999999"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {(selectedRole === "ngo" || selectedRole === "admin") && (
                  <div className="space-y-2">
                    <Label htmlFor="signup-organization">Organization</Label>
                    <Input
                      id="signup-organization"
                      type="text"
                      placeholder="Organization/Agency name"
                      value={formData.organization}
                      onChange={(e) => handleInputChange("organization", e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signup-location"
                      type="text"
                      placeholder="City, State"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Choose a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password *</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Terms & Privacy */}
          <div className="text-xs text-muted-foreground text-center space-y-2">
            <p>
              By signing up, you agree to our{" "}
              <button className="text-primary hover:underline">Terms of Service</button>
              {" "}and{" "}
              <button className="text-primary hover:underline">Privacy Policy</button>
            </p>
            {selectedRole === "admin" && (
              <Badge variant="outline" className="text-xs">
                Admin accounts require verification
              </Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}