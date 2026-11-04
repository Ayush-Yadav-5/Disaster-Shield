import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Users, 
  Building2, 
  Shield, 
  AlertTriangle, 
  Phone,
  Star,
  Award
} from "lucide-react";
import { useState } from "react";
import { AuthModal } from "./AuthModal";

interface CallToActionProps {
  onNavigate?: (tab: string) => void;
}

export function CallToAction({ onNavigate }: CallToActionProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleReportEmergency = () => {
    if (onNavigate) {
      onNavigate('report');
    }
  };

  const handleCallEmergency = () => {
    // Show emergency numbers with Indian standards
    const emergencyNumbers = [
      { name: "National Emergency", number: "112" },
      { name: "NDRF Helpline", number: "+91-9711077372" },
      { name: "NDMA Control Room", number: "+91-11-26701728" },
      { name: "SACHET Helpline", number: "1070" }
    ];
    
    const selectedNumber = emergencyNumbers[0]; // Default to 112
    window.open(`tel:${selectedNumber.number}`, '_self');
  };

  return (
    <>
      <section className="py-16 lg:py-24 xl:py-32 bg-gradient-to-br from-destructive/5 to-destructive/10">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="max-w-[1920px] mx-auto">
            {/* Emergency Call to Action */}
            <div className="text-center mb-16 xl:mb-20">
              <div className="inline-flex items-center space-x-2 bg-destructive/10 px-4 py-2 rounded-full mb-6">
                <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
                <span className="text-destructive font-medium">IN CASE OF EMERGENCY</span>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Every Second Counts in an Emergency
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Don't wait. Report incidents immediately or call emergency services directly. 
                Our platform ensures your emergency reaches the right responders instantly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-lg px-8 py-4"
                  onClick={handleReportEmergency}
                >
                  <AlertTriangle className="w-6 h-6 mr-3" />
                  Report Emergency
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground text-lg px-8 py-4"
                  onClick={handleCallEmergency}
                >
                  <Phone className="w-6 h-6 mr-3" />
                  Call Emergency Services
                </Button>
              </div>

              {/* Emergency Numbers Display */}
              <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center space-x-2 bg-white/50 px-3 py-2 rounded-lg">
                  <Phone className="w-4 h-4 text-destructive" />
                  <span className="font-medium">112 - National Emergency</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/50 px-3 py-2 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">9711077372 - NDRF</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/50 px-3 py-2 rounded-lg">
                  <Building2 className="w-4 h-4 text-green-600" />
                  <span className="font-medium">011-2670-1728 - NDMA</span>
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Trusted by Emergency Responders Nationwide
                </h3>
                <p className="text-muted-foreground">
                  Our platform is actively used by disaster management agencies across India
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 xl:gap-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">0</div>
                  <div className="text-sm text-muted-foreground">Registered Users</div>
                  <Badge variant="outline" className="text-xs mt-1">Coming Soon</Badge>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">0</div>
                  <div className="text-sm text-muted-foreground">Incidents Handled</div>
                  <Badge variant="outline" className="text-xs mt-1">Coming Soon</Badge>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">0</div>
                  <div className="text-sm text-muted-foreground">Partner Organizations</div>
                  <Badge variant="outline" className="text-xs mt-1">Coming Soon</Badge>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime Reliability</div>
                  <Badge variant="secondary" className="text-xs mt-1">Live</Badge>
                </div>
              </div>

              {/* Testimonials */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-10">
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      "Essential tool for disaster management. Quick response times and reliable communication."
                    </p>
                    <p className="text-xs font-medium mt-2">- NDRF Team Leader</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      "User-friendly interface makes reporting emergencies incredibly simple and fast."
                    </p>
                    <p className="text-xs font-medium mt-2">- Community Volunteer</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex justify-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground italic">
                      "Excellent coordination platform. Helps us manage resources and volunteers efficiently."
                    </p>
                    <p className="text-xs font-medium mt-2">- NGO Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultRole={selectedRole}
      />
    </>
  );
}
