import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  AlertTriangle, 
  Map, 
  Heart, 
  Users, 
  Camera, 
  Shield,
  MessageSquare,
  Navigation,
  QrCode,
  ArrowRight,
  Zap,
  BarChart3,
  Cloud,
  Radio,
  Database,
  Lock
} from "lucide-react";
import { motion } from "motion/react";

interface LandingFeaturesProps {
  onNavigate?: (tab: string) => void;
}

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  action: string;
  actionLabel: string;
  gradient: string;
}

const features: Feature[] = [
  {
    icon: AlertTriangle,
    title: "Instant Emergency Reporting",
    description: "Report disasters with one click. GPS auto-detection, photo/video uploads, and real-time incident tracking for immediate response.",
    badge: "Real-time",
    badgeColor: "bg-red-100 text-red-700 border-red-200",
    action: "report",
    actionLabel: "Report Now",
    gradient: "from-red-500 to-orange-500"
  },
  {
    icon: Map,
    title: "Live Incident Mapping",
    description: "Interactive maps with live incident markers, relief centers, evacuation routes, and AI-powered risk heatmaps for strategic planning.",
    badge: "AI Maps",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    action: "live-map",
    actionLabel: "View Map",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Users,
    title: "Smart Volunteer Coordination",
    description: "AI-powered task matching, GPS tracking, skill-based assignments, and real-time communication for efficient volunteer management.",
    badge: "Smart Match",
    badgeColor: "bg-green-100 text-green-700 border-green-200",
    action: "volunteers",
    actionLabel: "Join Network",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Heart,
    title: "Transparent Donations",
    description: "Secure donation platform with blockchain-verified transactions, real-time fund tracking, and complete transparency reports.",
    badge: "Verified",
    badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
    action: "donations",
    actionLabel: "Donate",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Camera,
    title: "AI Damage Assessment",
    description: "ML-powered image analysis for automatic damage severity scoring, infrastructure impact assessment, and priority classification.",
    badge: "AI Vision",
    badgeColor: "bg-orange-100 text-orange-700 border-orange-200",
    action: "report",
    actionLabel: "Assess",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Navigation,
    title: "Smart Evacuation Routes",
    description: "AI-optimized pathfinding with real-time hazard avoidance, capacity management, and dynamic route updates for safe evacuation.",
    badge: "Optimized",
    badgeColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
    action: "live-map",
    actionLabel: "View Routes",
    gradient: "from-indigo-500 to-blue-500"
  },
  {
    icon: Radio,
    title: "Real-Time Alerts",
    description: "Government-integrated alert system pulling live data from NDMA, SACHET, and IMD with AI-merged notifications to reduce alert fatigue.",
    badge: "Gov Sync",
    badgeColor: "bg-yellow-100 text-yellow-700 border-yellow-200",
    action: "home",
    actionLabel: "See Alerts",
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive analytics with incident trends, resource utilization, volunteer performance, and predictive disaster modeling.",
    badge: "Insights",
    badgeColor: "bg-teal-100 text-teal-700 border-teal-200",
    action: "home",
    actionLabel: "View Stats",
    gradient: "from-teal-500 to-green-500"
  },
  {
    icon: MessageSquare,
    title: "Command Communication",
    description: "Encrypted messaging between all stakeholders with group channels, file sharing, and emergency broadcast capabilities.",
    badge: "Secure",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    action: "volunteers",
    actionLabel: "Connect",
    gradient: "from-slate-500 to-gray-500"
  }
];

const integrations = [
  { name: "NDMA", icon: Shield, color: "text-blue-600", bg: "bg-blue-100" },
  { name: "NDRF", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
  { name: "SACHET", icon: Radio, color: "text-green-600", bg: "bg-green-100" },
  { name: "IMD Weather", icon: Cloud, color: "text-cyan-600", bg: "bg-cyan-100" },
  { name: "OpenAI", icon: Zap, color: "text-purple-600", bg: "bg-purple-100" },
  { name: "Secure DB", icon: Lock, color: "text-orange-600", bg: "bg-orange-100" }
];

export function LandingFeatures({ onNavigate }: LandingFeaturesProps) {
  const handleFeatureClick = (action: string) => {
    if (onNavigate) {
      onNavigate(action);
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-muted/30 to-background">
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="max-w-[1920px] mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-16 xl:mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-4 px-4 py-2">
              <Database className="w-4 h-4 mr-2" />
              Comprehensive Platform
            </Badge>
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
              Complete Emergency
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Response Suite</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Everything you need for effective disaster management - from initial alert to complete recovery. 
              Powered by AI, integrated with government systems, and trusted by emergency responders.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10 mb-20">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card 
                    className="group h-full hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-transparent relative overflow-hidden"
                    onClick={() => handleFeatureClick(feature.action)}
                  >
                    {/* Gradient Border Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                    
                    <CardHeader className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                        <Badge variant="outline" className={feature.badgeColor}>
                          {feature.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="relative space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white group-hover:border-transparent transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeatureClick(feature.action);
                        }}
                      >
                        {feature.actionLabel}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Integrations Section */}
          <motion.div
            className="bg-white rounded-3xl p-10 lg:p-16 shadow-2xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Integrated with Leading Platforms
              </h3>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our system seamlessly connects with government agencies, weather services, and AI platforms 
                to provide the most comprehensive disaster management solution.
              </p>
            </div>

            {/* Integration Logos */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
              {integrations.map((integration, index) => {
                const Icon = integration.icon;
                return (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`w-12 h-12 ${integration.bg} rounded-full flex items-center justify-center mb-3`}>
                      <Icon className={`w-6 h-6 ${integration.color}`} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{integration.name}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                  24/7
                </div>
                <div className="text-sm text-muted-foreground">Monitoring</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-2">
                  99.9%
                </div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-2">
                  <2s
                </div>
                <div className="text-sm text-muted-foreground">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                  AI
                </div>
                <div className="text-sm text-muted-foreground">Powered</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
