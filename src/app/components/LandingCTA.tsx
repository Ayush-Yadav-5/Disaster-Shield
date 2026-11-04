import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Users, 
  Heart, 
  Building2, 
  Shield, 
  AlertTriangle, 
  Phone,
  UserPlus,
  ArrowRight,
  CheckCircle,
  Star,
  Zap,
  TrendingUp
} from "lucide-react";
import { useState } from "react";
import { AuthModal } from "./AuthModal";
import { motion } from "motion/react";

interface LandingCTAProps {
  onNavigate?: (tab: string) => void;
}

interface UserRole {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  badge: string;
  gradient: string;
  iconColor: string;
}

const userRoles: UserRole[] = [
  {
    id: "citizen",
    title: "Citizens",
    description: "Report incidents, receive alerts, access emergency services instantly",
    icon: Users,
    features: [
      "One-click emergency reporting",
      "Real-time disaster alerts",
      "Find nearest shelters & aid",
      "Track your requests",
      "Family safety check-in"
    ],
    badge: "Free Access",
    gradient: "from-blue-500 to-cyan-500",
    iconColor: "text-blue-600"
  },
  {
    id: "volunteer",
    title: "Volunteers",
    description: "Join rescue missions, coordinate relief, make a real impact",
    icon: Heart,
    features: [
      "AI-matched rescue tasks",
      "GPS-based assignments",
      "Team communication",
      "Track volunteer hours",
      "Training & certification"
    ],
    badge: "Make Impact",
    gradient: "from-green-500 to-emerald-500",
    iconColor: "text-green-600"
  },
  {
    id: "ngo",
    title: "NGOs",
    description: "Manage resources, coordinate teams, maximize disaster relief impact",
    icon: Building2,
    features: [
      "Resource management",
      "Volunteer coordination",
      "Donation tracking",
      "Impact analytics",
      "Government integration"
    ],
    badge: "Organization",
    gradient: "from-purple-500 to-pink-500",
    iconColor: "text-purple-600"
  },
  {
    id: "admin",
    title: "Emergency Admin",
    description: "Command center access, full control, strategic coordination",
    icon: Shield,
    features: [
      "Command dashboard",
      "Resource allocation",
      "Incident management",
      "Real-time analytics",
      "Inter-agency sync"
    ],
    badge: "Admin Access",
    gradient: "from-red-500 to-orange-500",
    iconColor: "text-red-600"
  }
];

const testimonials = [
  {
    text: "This platform transformed our disaster response capabilities. Real-time coordination saved countless lives.",
    author: "NDRF Team Leader",
    role: "National Disaster Response Force",
    rating: 5
  },
  {
    text: "The volunteer matching system is incredible. We can deploy the right people with the right skills instantly.",
    author: "NGO Director",
    role: "Relief Organization",
    rating: 5
  },
  {
    text: "As a citizen, being able to report emergencies and track help in real-time gives tremendous peace of mind.",
    author: "Community Member",
    role: "Delhi",
    rating: 5
  }
];

export function LandingCTA({ onNavigate }: LandingCTAProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleRoleLogin = (roleId: string) => {
    setSelectedRole(roleId);
    setAuthModalOpen(true);
  };

  const handleReportEmergency = () => {
    if (onNavigate) {
      onNavigate('report');
    }
  };

  return (
    <>
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="max-w-[1920px] mx-auto space-y-20">
            
            {/* Emergency CTA Section */}
            <motion.div 
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-500 to-orange-500 p-12 lg:p-16 text-white"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4zIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
              </div>

              <div className="relative text-center max-w-4xl mx-auto">
                <motion.div
                  className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-8"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                  <span className="font-semibold">EMERGENCY RESPONSE AVAILABLE 24/7</span>
                </motion.div>

                <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
                  Every Second Counts
                  <br />in an Emergency
                </h2>
                
                <p className="text-xl lg:text-2xl mb-10 text-white/90 leading-relaxed">
                  Don't wait. Report disasters instantly or call emergency services directly. 
                  Our AI-powered platform ensures your alert reaches the right responders in seconds.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <Button 
                    size="lg" 
                    className="bg-white text-red-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all text-lg px-10 py-7"
                    onClick={handleReportEmergency}
                  >
                    <AlertTriangle className="w-6 h-6 mr-3" />
                    Report Emergency Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm text-lg px-10 py-7"
                    onClick={() => window.open('tel:112', '_self')}
                  >
                    <Phone className="w-6 h-6 mr-3" />
                    Call 112
                  </Button>
                </div>

                {/* Emergency Contact Pills */}
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    { label: "112 - National Emergency", icon: Phone },
                    { label: "NDRF: +91-9711077372", icon: Shield },
                    { label: "NDMA: +91-11-26701728", icon: Building2 }
                  ].map((contact, index) => {
                    const Icon = contact.icon;
                    return (
                      <div key={index} className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{contact.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Role Selection Section */}
            <div>
              <motion.div 
                className="text-center mb-14"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-4 px-4 py-2">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join the Network
                </Badge>
                <h3 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                  Choose Your Role in
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Disaster Response</span>
                </h3>
                <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                  Get access to specialized tools designed for your specific needs. 
                  Whether you're a citizen, volunteer, NGO, or emergency service - we've got you covered.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 mb-16">
                {userRoles.map((role, index) => {
                  const IconComponent = role.icon;
                  return (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card 
                        className="group h-full cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-transparent relative overflow-hidden"
                        onClick={() => handleRoleLogin(role.id)}
                      >
                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                        
                        <CardHeader className="relative">
                          <div className="flex items-center justify-between mb-4">
                            <div className={`w-14 h-14 bg-gradient-to-br ${role.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                              <IconComponent className="w-7 h-7 text-white" />
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {role.badge}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl">
                            {role.title}
                          </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="relative space-y-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {role.description}
                          </p>
                          
                          <ul className="space-y-2">
                            {role.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start text-xs text-muted-foreground">
                                <CheckCircle className="w-3.5 h-3.5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                          
                          <Button 
                            className={`w-full group-hover:bg-gradient-to-r group-hover:${role.gradient} group-hover:text-white transition-all shadow-md`}
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRoleLogin(role.id);
                            }}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Get Started
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Testimonials & Stats */}
            <motion.div
              className="bg-white rounded-3xl p-10 lg:p-16 shadow-2xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-12">
                <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  Trusted by Emergency Responders Nationwide
                </h3>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  Our platform is the choice of disaster management agencies across India
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {[
                  { value: "0", label: "Active Users", icon: Users, gradient: "from-blue-500 to-cyan-500" },
                  { value: "0", label: "Incidents Handled", icon: AlertTriangle, gradient: "from-green-500 to-emerald-500" },
                  { value: "0", label: "NGO Partners", icon: Building2, gradient: "from-purple-500 to-pink-500" },
                  { value: "24/7", label: "Uptime", icon: Zap, gradient: "from-red-500 to-orange-500" }
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      className="text-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Testimonials */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    className="bg-muted/50 p-6 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-center mb-3">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground italic mb-4 leading-relaxed">
                      "{testimonial.text}"
                    </p>
                    <div className="text-center">
                      <div className="font-semibold text-sm">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

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