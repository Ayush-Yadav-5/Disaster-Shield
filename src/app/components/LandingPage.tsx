import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  Heart,
  MapPin,
  Phone,
  Map,
  Camera,
  Navigation,
  QrCode,
  MessageSquare,
  Building2,
  CheckCircle,
  ArrowRight,
  Star,
  Award,
  TrendingUp,
  Globe,
  Zap,
  UserPlus
} from "lucide-react";
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { WeatherTracker } from "./WeatherTracker";

interface LandingPageProps {
  onNavigate: (tab: string) => void;
}

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge: string;
  action: string;
}

interface UserRole {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  badge: string;
  color: string;
  bgColor: string;
}

const features: Feature[] = [
  {
    icon: AlertTriangle,
    title: "Quick Emergency Reporting",
    description: "Report incidents instantly with location auto-detection and photo uploads",
    badge: "Real-time",
    action: "report"
  },
  {
    icon: Map,
    title: "Live Incident Mapping",
    description: "Interactive maps showing real-time alerts, relief centers, and safe routes",
    badge: "Live Data",
    action: "live-map"
  },
  {
    icon: Heart,
    title: "Transparent Donations",
    description: "Secure donation platform with full transparency and blockchain receipts",
    badge: "Verified",
    action: "donations"
  },
  {
    icon: Users,
    title: "Volunteer Coordination",
    description: "Connect volunteers with tasks and manage resource allocation efficiently",
    badge: "Smart Matching",
    action: "volunteers"
  },
  {
    icon: Camera,
    title: "AI Damage Assessment",
    description: "ML-powered analysis of damage reports with severity scoring",
    badge: "AI Powered",
    action: "report"
  },
  {
    icon: Navigation,
    title: "Smart Evacuation Routes",
    description: "AI-optimized evacuation planning with real-time hazard overlays",
    badge: "Optimized",
    action: "live-map"
  }
];

const userRoles: UserRole[] = [
  {
    id: "citizen",
    title: "Citizens",
    description: "Report incidents, get alerts, access emergency services",
    icon: Users,
    features: [
      "Report emergencies instantly",
      "Receive real-time alerts",
      "Find nearest shelters",
      "Access emergency contacts"
    ],
    badge: "Free Access",
    color: "text-[#005A9C]",
    bgColor: "bg-blue-50 border-blue-200 hover:bg-blue-100"
  },
  {
    id: "volunteer",
    title: "Volunteers",
    description: "Join rescue operations, coordinate relief efforts",
    icon: Heart,
    features: [
      "Join rescue operations",
      "Coordinate with teams",
      "Track volunteer hours",
      "Receive task assignments"
    ],
    badge: "Community Impact",
    color: "text-[#027A48]",
    bgColor: "bg-green-50 border-green-200 hover:bg-green-100"
  },
  {
    id: "ngo",
    title: "NGOs & Organizations",
    description: "Manage resources, coordinate with government agencies",
    icon: Building2,
    features: [
      "Resource management",
      "Team coordination",
      "Impact tracking",
      "Donation management"
    ],
    badge: "Organization Tools",
    color: "text-purple-700",
    bgColor: "bg-purple-50 border-purple-200 hover:bg-purple-100"
  },
  {
    id: "admin",
    title: "Emergency Services",
    description: "Command center access, resource allocation",
    icon: Shield,
    features: [
      "Command center dashboard",
      "Resource allocation",
      "Incident management",
      "Inter-agency coordination"
    ],
    badge: "Admin Access",
    color: "text-[#D92D20]",
    bgColor: "bg-red-50 border-red-200 hover:bg-red-100"
  }
];

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleRoleLogin = (roleId: string) => {
    setSelectedRole(roleId);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="max-w-[1920px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge className="bg-[#005A9C] text-white hover:bg-[#005A9C]/90">
                    <Shield className="w-4 h-4 mr-2" />
                    NDMA INTEGRATED PLATFORM
                  </Badge>
                  
                  <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                    <span className="text-foreground">Smart Disaster</span>
                    <br />
                    <span className="text-[#005A9C]">Management System</span>
                  </h1>
                  
                  <p className="text-xl text-muted-foreground max-w-2xl">
                    A unified, intuitive platform empowering citizens, volunteers, NGOs, 
                    and government agencies throughout the entire disaster lifecycle.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="bg-[#D92D20] hover:bg-[#D92D20]/90 text-white px-8 py-6 text-lg"
                    onClick={() => onNavigate('report')}
                  >
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Report an Incident
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-[#005A9C] text-[#005A9C] hover:bg-[#005A9C] hover:text-white px-8 py-6 text-lg"
                    onClick={() => handleRoleLogin('volunteer')}
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Register as Volunteer
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8">
                  <div>
                    <div className="text-3xl font-bold text-[#005A9C]">24/7</div>
                    <div className="text-sm text-muted-foreground">Emergency Response</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#027A48]">100%</div>
                    <div className="text-sm text-muted-foreground">Uptime SLA</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#F79009]">Real-time</div>
                    <div className="text-sm text-muted-foreground">Data Updates</div>
                  </div>
                </div>
              </div>

              {/* Right Content - Weather & Stats */}
              <div className="relative">
                <Card className="bg-white shadow-2xl border-2">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Live Weather & Emergency Alerts</h3>
                    <WeatherTracker compact={true} />
                  </CardContent>
                </Card>

                {/* Floating Emergency Contact */}
                <Card className="absolute -bottom-4 -left-4 bg-[#D92D20] text-white shadow-xl max-w-xs">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Emergency Helpline</p>
                        <p className="text-2xl font-bold">112</p>
                      </div>
                      <Phone className="w-8 h-8" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-white">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Comprehensive Emergency Response
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Integrated tools for the entire disaster lifecycle—from prevention to recovery
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card 
                    key={index}
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-[#005A9C]"
                    onClick={() => onNavigate(feature.action)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-[#005A9C]/10 rounded-lg flex items-center justify-center group-hover:bg-[#005A9C]/20 transition-colors">
                          <Icon className="w-7 h-7 text-[#005A9C]" />
                        </div>
                        <Badge variant="secondary">{feature.badge}</Badge>
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground mb-4">{feature.description}</p>
                      <Button 
                        variant="ghost" 
                        className="group-hover:text-[#005A9C] p-0"
                      >
                        Learn more <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Integration Badges */}
            <div className="mt-16 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-center mb-8">
                Powered by Advanced Technology
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Shield className="w-8 h-8 text-[#005A9C]" />
                  </div>
                  <p className="font-semibold">NDMA Certified</p>
                  <p className="text-sm text-muted-foreground">Government Approved</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Zap className="w-8 h-8 text-[#F79009]" />
                  </div>
                  <p className="font-semibold">AI Enhanced</p>
                  <p className="text-sm text-muted-foreground">Smart Analysis</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Globe className="w-8 h-8 text-[#027A48]" />
                  </div>
                  <p className="font-semibold">Real-time Data</p>
                  <p className="text-sm text-muted-foreground">Live Updates</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Award className="w-8 h-8 text-[#D92D20]" />
                  </div>
                  <p className="font-semibold">24/7 Monitoring</p>
                  <p className="text-sm text-muted-foreground">Always Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Network Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Join Our Emergency Response Network
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Choose your role and get access to specialized tools designed for your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {userRoles.map((role) => {
                const Icon = role.icon;
                return (
                  <Card 
                    key={role.id}
                    className={`group ${role.bgColor} cursor-pointer transition-all duration-300 hover:shadow-xl border-2`}
                    onClick={() => handleRoleLogin(role.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                          <Icon className={`w-6 h-6 ${role.color}`} />
                        </div>
                        <Badge variant="secondary" className="text-xs">{role.badge}</Badge>
                      </div>
                      
                      <h3 className={`text-xl font-bold mb-2 ${role.color}`}>
                        {role.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {role.description}
                      </p>
                      
                      <ul className="space-y-2 mb-6">
                        {role.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <CheckCircle className="w-4 h-4 text-[#027A48] mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className={`w-full ${role.color} bg-white hover:bg-opacity-90`}
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRoleLogin(role.id);
                        }}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Join Now
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency CTA Banner */}
      <section className="py-16 bg-[#D92D20]">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center text-white">
              <AlertTriangle className="w-16 h-16 mx-auto mb-6 animate-pulse" />
              <h2 className="text-4xl font-bold mb-4">In Case of Emergency</h2>
              <p className="text-xl mb-8 opacity-90">
                Every second counts. Report incidents immediately or call emergency services directly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button 
                  size="lg"
                  className="bg-white text-[#D92D20] hover:bg-gray-100 px-8 py-6 text-lg"
                  onClick={() => onNavigate('report')}
                >
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Report Emergency
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#D92D20] px-8 py-6 text-lg"
                  onClick={() => window.open('tel:112', '_self')}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call 112
                </Button>
              </div>

              {/* Emergency Numbers */}
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Phone className="w-4 h-4 inline mr-2" />
                  112 - National Emergency
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Shield className="w-4 h-4 inline mr-2" />
                  9711077372 - NDRF
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  011-2670-1728 - NDMA
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="max-w-[1920px] mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                Trusted by Emergency Responders Nationwide
              </h2>
              <p className="text-xl text-muted-foreground">
                See what disaster management professionals say about our platform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "Essential tool for disaster management. Quick response times and reliable communication.",
                  author: "NDRF Team Leader",
                  rating: 5
                },
                {
                  quote: "User-friendly interface makes reporting emergencies incredibly simple and fast.",
                  author: "Community Volunteer",
                  rating: 5
                },
                {
                  quote: "Excellent coordination platform. Helps us manage resources efficiently.",
                  author: "NGO Director",
                  rating: 5
                }
              ].map((testimonial, idx) => (
                <Card key={idx} className="bg-gradient-to-br from-blue-50 to-white">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-[#F79009] fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
                    <p className="font-semibold text-sm">— {testimonial.author}</p>
                  </CardContent>
                </Card>
              ))}
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
    </div>
  );
}
