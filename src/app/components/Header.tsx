import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Globe, Phone, AlertTriangle } from "lucide-react";

export function Header() {
  return (
    <header className="w-full bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-destructive rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">DisasterShield</h1>
              <p className="text-xs text-muted-foreground">Emergency Response System</p>
            </div>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center space-x-4">
            {/* Emergency Hotline */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4 text-destructive" />
              <span className="text-foreground font-medium">Emergency: 911</span>
            </div>

            {/* Language Selector */}
            <Select defaultValue="en">
              <SelectTrigger className="w-32 h-9">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
              </SelectContent>
            </Select>

            {/* Login Button */}
            <Button variant="outline" size="sm">
              Login
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}