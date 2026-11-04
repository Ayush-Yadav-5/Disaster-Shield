import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Shield, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  MessageCircle
} from "lucide-react";

interface FooterProps {
  onNavigate?: (tab: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleNavigation = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmergencyCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  return (
    <footer className="bg-muted/50 border-t border-border">
      {/* Emergency Banner */}
      <div className="bg-destructive text-destructive-foreground py-3">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="max-w-[1920px] mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Emergency? Call immediately:</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleEmergencyCall('112')}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Phone className="w-4 h-4 mr-2" />
                112 - National Emergency
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleEmergencyCall('+919711077372')}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Phone className="w-4 h-4 mr-2" />
                NDRF Helpline
              </Button>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12 xl:py-16">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-12">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-destructive" />
                <h3 className="font-semibold text-foreground text-lg">DisasterShield</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Protecting communities through smart emergency response technology. 
                Connecting citizens, volunteers, NGOs, and emergency responders for effective disaster management.
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExternalLink('https://facebook.com')}
                  className="h-8 w-8 p-0"
                >
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExternalLink('https://twitter.com')}
                  className="h-8 w-8 p-0"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExternalLink('https://instagram.com')}
                  className="h-8 w-8 p-0"
                >
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExternalLink('https://linkedin.com')}
                  className="h-8 w-8 p-0"
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Emergency Services */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Emergency Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button 
                    className="hover:text-foreground transition-colors flex items-center space-x-2"
                    onClick={() => handleNavigation('report')}
                  >
                    <span>Report Incident</span>
                  </button>
                </li>
                <li>
                  <button 
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleNavigation('live-map')}
                  >
                    Find Nearest Shelter
                  </button>
                </li>
                <li>
                  <button 
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleNavigation('live-map')}
                  >
                    Relief Centers
                  </button>
                </li>
                <li>
                  <button 
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleEmergencyCall('112')}
                  >
                    Emergency Contacts
                  </button>
                </li>
                <li>
                  <button 
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleExternalLink('https://ndma.gov.in')}
                  >
                    NDMA Portal <ExternalLink className="w-3 h-3 inline ml-1" />
                  </button>
                </li>
                <li>
                  <button 
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleExternalLink('https://ndrf.gov.in')}
                  >
                    NDRF Portal <ExternalLink className="w-3 h-3 inline ml-1" />
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Get Involved */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Get Involved</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button 
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleNavigation('volunteers')}
                  >
                    Volunteer Registration
                  </button>
                </li>
                <li>
                  <button 
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleNavigation('donations')}
                  >
                    Make a Donation
                  </button>
                </li>
                <li>
                  <button 
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleNavigation('volunteers')}
                  >
                    NGO Partnership
                  </button>
                </li>
                <li>
                  <button 
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleNavigation('volunteers')}
                  >
                    Corporate Partnership
                  </button>
                </li>
                <li>
                  <button 
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleNavigation('volunteers')}
                  >
                    Training Programs
                  </button>
                </li>
                <li>
                  <button 
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleExternalLink('/community')}
                  >
                    Community Forum
                  </button>
                </li>
              </ul>
            </div>
            
            {/* Resources & Support */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Resources & Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button 
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleExternalLink('/preparedness-guide')}
                  >
                    Disaster Preparedness Guide
                  </button>
                </li>
                <li>
                  <button 
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleExternalLink('/safety-tips')}
                  >
                    Safety Tips & Protocols
                  </button>
                </li>
                <li>
                  <button 
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleNavigation('volunteers')}
                  >
                    Training Materials
                  </button>
                </li>
                <li>
                  <button 
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleExternalLink('/api-docs')}
                  >
                    API Documentation
                  </button>
                </li>
                <li>
                  <button 
                    className="hover:text-foreground transition-colors"
                    onClick={() => handleExternalLink('/help-center')}
                  >
                    Help Center
                  </button>
                </li>
                <li>
                  <button 
                    className="hover:text-foreground transition-colors flex items-center space-x-2"
                    onClick={() => handleExternalLink('/contact')}
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Contact Support</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mt-8 pt-8 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h5 className="font-medium text-foreground">Emergency Helpline</h5>
                  <p className="text-sm text-muted-foreground">112 (National Emergency)</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h5 className="font-medium text-foreground">Support Email</h5>
                  <p className="text-sm text-muted-foreground">support@disastershield.gov.in</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h5 className="font-medium text-foreground">Headquarters</h5>
                  <p className="text-sm text-muted-foreground">NDMA Building, New Delhi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Numbers Grid */}
          <div className="mt-8 pt-8 border-t border-border">
            <h4 className="font-medium text-foreground mb-4">Important Emergency Numbers</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xl:gap-6">
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEmergencyCall('112')}
                  className="text-red-700 hover:text-red-800 font-medium"
                >
                  112
                </Button>
                <p className="text-xs text-red-600 mt-1">National Emergency</p>
              </div>
              
              <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEmergencyCall('+919711077372')}
                  className="text-orange-700 hover:text-orange-800 font-medium text-xs"
                >
                  9711077372
                </Button>
                <p className="text-xs text-orange-600 mt-1">NDRF Helpline</p>
              </div>
              
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEmergencyCall('+911126701728')}
                  className="text-blue-700 hover:text-blue-800 font-medium text-xs"
                >
                  011-2670-1728
                </Button>
                <p className="text-xs text-blue-600 mt-1">NDMA Control Room</p>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEmergencyCall('1070')}
                  className="text-purple-700 hover:text-purple-800 font-medium"
                >
                  1070
                </Button>
                <p className="text-xs text-purple-600 mt-1">SACHET Helpline</p>
              </div>
            </div>
          </div>

          {/* Certification & Legal */}
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="flex flex-wrap items-center gap-4">
                <Badge variant="outline" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Government Certified
                </Badge>
                <Badge variant="outline" className="text-xs">
                  ISO 27001 Compliant
                </Badge>
                <Badge variant="outline" className="text-xs">
                  NDMA Approved
                </Badge>
                <Badge variant="outline" className="text-xs">
                  24/7 Monitoring
                </Badge>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <button 
                  className="hover:text-foreground transition-colors"
                  onClick={() => handleExternalLink('/privacy-policy')}
                >
                  Privacy Policy
                </button>
                <button 
                  className="hover:text-foreground transition-colors"
                  onClick={() => handleExternalLink('/terms-of-service')}
                >
                  Terms of Service
                </button>
                <button 
                  className="hover:text-foreground transition-colors"
                  onClick={() => handleExternalLink('/accessibility')}
                >
                  Accessibility
                </button>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
              <p>&copy; {currentYear} DisasterShield. A Government of India Initiative.</p>
              <p className="mt-1">Powered by National Disaster Management Authority (NDMA) & National Disaster Response Force (NDRF)</p>
              <p className="mt-2 text-xs">
                This platform is developed in collaboration with leading disaster management agencies and technology partners to ensure 
                reliable, scalable, and secure emergency response capabilities across India.
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </footer>
  );
}