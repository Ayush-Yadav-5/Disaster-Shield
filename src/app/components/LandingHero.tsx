import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  MapPin, 
  Phone,
  TrendingUp,
  Activity,
  CheckCircle,
  Zap
} from "lucide-react";
import { motion } from "motion/react";

interface LandingHeroProps {
  onNavigate?: (tab: string) => void;
}

export function LandingHero({ onNavigate }: LandingHeroProps) {
  const handleReportEmergency = () => {
    if (onNavigate) {
      onNavigate('report');
    }
  };

  const handleCallEmergency = () => {
    window.open('tel:112', '_self');
  };

  const stats = [
    { label: "24/7", sublabel: "Emergency Response", icon: Activity },
    { label: "100%", sublabel: "Uptime Guarantee", icon: TrendingUp },
    { label: "112", sublabel: "Emergency Hotline", icon: Phone },
    { label: "AI", sublabel: "Powered Alerts", icon: Zap }
  ];

  const features = [
    { text: "Real-time incident tracking", icon: MapPin },
    { text: "AI-powered damage assessment", icon: Zap },
    { text: "Instant emergency alerts", icon: AlertTriangle },
    { text: "Volunteer coordination", icon: Users }
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-red-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNkYmRiZGIiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTIwIDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDEwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0xNi0xNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMC0xMGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptLTE2IDBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
      </div>

      <div className="relative w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24 py-16">
        <div className="max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">
            {/* Left Column - Content */}
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-6">
                <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 px-4 py-2">
                  <Shield className="w-4 h-4 mr-2" />
                  NDMA Integrated Platform
                </Badge>
                
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  Smart Disaster
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600"> Management</span>
                  <br />System
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  A unified platform connecting citizens, volunteers, NGOs, and emergency services for 
                  rapid disaster response and recovery across India.
                </p>
              </div>

              {/* Key Features List */}
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6"
                  onClick={handleReportEmergency}
                >
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Report Emergency
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-red-600 text-red-600 hover:bg-red-50 text-lg px-8 py-6"
                  onClick={handleCallEmergency}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call 112
                </Button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4 pt-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      className="text-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="flex justify-center mb-2">
                        <Icon className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="font-bold text-foreground">{stat.label}</div>
                      <div className="text-xs text-muted-foreground">{stat.sublabel}</div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right Column - Visual Element */}
            <motion.div
              className="relative lg:h-[600px]"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Main Card */}
              <Card className="absolute top-0 right-0 w-full h-full bg-white shadow-2xl overflow-hidden">
                <CardContent className="p-0 h-full relative">
                  {/* Emergency Dashboard Preview */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-red-500 opacity-10"></div>
                  
                  <div className="relative h-full p-8 flex flex-col justify-between">
                    {/* Top Section */}
                    <div>
                      <Badge className="bg-green-100 text-green-700 mb-4">
                        <Activity className="w-3 h-3 mr-1" />
                        System Online
                      </Badge>
                      <h3 className="text-2xl font-bold mb-2">Real-Time Command Center</h3>
                      <p className="text-muted-foreground">
                        Monitor incidents, coordinate resources, and manage emergency response in real-time
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold">0</div>
                              <div className="text-xs text-muted-foreground">Active Incidents</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold">0</div>
                              <div className="text-xs text-muted-foreground">Volunteers</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                              <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold">24/7</div>
                              <div className="text-xs text-muted-foreground">Response</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-2xl font-bold">0</div>
                              <div className="text-xs text-muted-foreground">Relief Centers</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Bottom Badge */}
                    <div className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg">
                      <Zap className="w-5 h-5" />
                      <span className="font-semibold">AI-Powered Intelligence</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-6 -left-6 w-32 h-32 bg-red-100 rounded-full blur-2xl opacity-50"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.7, 0.5]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <motion.div
                className="absolute -bottom-6 -right-6 w-40 h-40 bg-blue-100 rounded-full blur-2xl opacity-50"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
