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
  ArrowRight
} from "lucide-react";

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge: string;
  action: string;
  actionLabel: string;
}

interface FeaturesProps {
  onNavigate?: (tab: string) => void;
}

const features: Feature[] = [
  {
    icon: AlertTriangle,
    title: "Quick Emergency Reporting",
    description: "Report incidents instantly with location auto-detection and photo uploads",
    badge: "Real-time",
    action: "report",
    actionLabel: "Report Emergency"
  },
  {
    icon: Map,
    title: "Live Incident Mapping",
    description: "Interactive maps showing real-time alerts, relief centers, and safe routes",
    badge: "Live Data",
    action: "live-map",
    actionLabel: "View Live Map"
  },
  {
    icon: Heart,
    title: "Transparent Donations",
    description: "Secure donation platform with full transparency and blockchain receipts",
    badge: "Verified",
    action: "donations",
    actionLabel: "Donate Now"
  },
  {
    icon: Users,
    title: "Volunteer Coordination",
    description: "Connect volunteers with tasks and manage resource allocation efficiently",
    badge: "Smart Matching",
    action: "volunteers",
    actionLabel: "Join as Volunteer"
  },
  {
    icon: Camera,
    title: "AI Damage Assessment",
    description: "ML-powered analysis of damage reports with severity scoring",
    badge: "AI Powered",
    action: "report",
    actionLabel: "Submit Assessment"
  },
  {
    icon: Shield,
    title: "Digital ID System",
    description: "QR-based survivor identification for shelter check-in and medical records",
    badge: "Secure",
    action: "volunteers",
    actionLabel: "Get Digital ID"
  },
  {
    icon: MessageSquare,
    title: "Real-time Communication",
    description: "Instant messaging between responders, volunteers, and command centers",
    badge: "Instant",
    action: "volunteers",
    actionLabel: "Join Network"
  },
  {
    icon: Navigation,
    title: "Smart Evacuation Routes",
    description: "AI-optimized evacuation planning with real-time hazard overlays",
    badge: "Optimized",
    action: "live-map",
    actionLabel: "View Routes"
  },
  {
    icon: QrCode,
    title: "Contact-free Check-ins",
    description: "QR code scanning for shelter management and resource tracking",
    badge: "Contactless",
    action: "volunteers",
    actionLabel: "Get QR Code"
  }
];

export function Features({ onNavigate }: FeaturesProps) {
  const handleFeatureClick = (action: string) => {
    if (onNavigate) {
      onNavigate(action);
    }
  };

  const handleExternalAction = (feature: Feature) => {
    switch (feature.action) {
      case "report":
        if (onNavigate) onNavigate("report");
        break;
      case "live-map":
        if (onNavigate) onNavigate("live-map");
        break;
      case "donations":
        if (onNavigate) onNavigate("donations");
        break;
      case "volunteers":
        if (onNavigate) onNavigate("volunteers");
        break;
      default:
        if (onNavigate) onNavigate("home");
    }
  };

  return (
    <section className="py-16 lg:py-24 xl:py-32 bg-muted/30">
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="max-w-[1920px] mx-auto">
        <div className="text-center mb-16 xl:mb-20">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Comprehensive Emergency Response Platform
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our integrated system provides all the tools needed for effective disaster management, 
            from initial reporting to post-disaster recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index} 
                className="relative group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-destructive/20"
                onClick={() => handleFeatureClick(feature.action)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                      <IconComponent className="w-6 h-6 text-destructive" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{feature.description}</p>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-destructive group-hover:text-destructive-foreground group-hover:border-destructive transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExternalAction(feature);
                    }}
                  >
                    {feature.actionLabel}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Card>
            );
          })}
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl p-8 shadow-lg border">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Powered by Advanced Technology
            </h3>
            <p className="text-muted-foreground mb-6 max-w-3xl mx-auto">
              Our platform integrates with NDMA, NDRF, and SACHET systems to provide comprehensive 
              disaster management capabilities. Built with cutting-edge technology including AI/ML, 
              real-time data processing, and secure blockchain-based verification.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 xl:gap-10">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-medium text-foreground">NDMA Certified</h4>
                <p className="text-sm text-muted-foreground">Government approved</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-medium text-foreground">Community Driven</h4>
                <p className="text-sm text-muted-foreground">Citizen participation</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-medium text-foreground">AI Enhanced</h4>
                <p className="text-sm text-muted-foreground">Smart analysis</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="font-medium text-foreground">24/7 Monitoring</h4>
                <p className="text-sm text-muted-foreground">Always available</p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}