import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { AlertTriangle, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { WeatherTracker } from "./WeatherTracker";

interface HeroProps {
  onNavigate?: (tab: string) => void;
}

interface HeroStats {
  activeVolunteers: number;
  reliefCenters: number;
}

export function Hero({ onNavigate }: HeroProps) {
  const [stats, setStats] = useState<HeroStats>({
    activeVolunteers: 0,
    reliefCenters: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // const res = await fetch("/api/dashboard/hero-stats");
        // const data = await res.json();
        // setStats(data);
        setStats({ activeVolunteers: 0, reliefCenters: 0 });
      } catch (e) {
        console.error("Error fetching hero stats:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleReportEmergency = () => onNavigate?.("report");
  const handleCallEmergency = () => window.open("tel:112", "_self");

  return (
    <section className="relative py-12 md:py-16 xl:py-20 overflow-hidden">
      {/* Soft background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 via-white to-red-50/60" />

      <div className="relative w-full px-5 sm:px-7 md:px-10 xl:px-14 2xl:px-20">
        {/* Stacked for zero overlap; compact gaps to reduce whitespace */}
        <div className="grid grid-cols-1 gap-8 md:gap-10 xl:gap-12 max-w-[1240px] mx-auto items-start">
          {/* ===================== LEFT: HERO TEXT ===================== */}
          <div className="min-w-0">
            {/* Kicker */}
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-destructive" />
              <span className="text-xs sm:text-[13px] font-semibold tracking-wide text-destructive">
                DISASTER RESPONSE SYSTEM
              </span>
            </div>

            {/* Title */}
            <h1 className="text-[30px] sm:text-[38px] md:text-[44px] font-bold text-foreground leading-snug tracking-tight break-words hyphens-auto">
              Protecting Communities Through{" "}
              <span className="text-destructive">Smart Emergency Response</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-3 text-[15px] sm:text-base text-muted-foreground max-w-2xl">
              Our comprehensive disaster management platform connects citizens,
              volunteers, NGOs, and emergency responders to save lives and
              minimize damage during critical situations.
            </p>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground flex-shrink-0 h-11 px-5"
                onClick={handleReportEmergency}
              >
                <AlertTriangle className="w-5 h-5 mr-2" />
                Report Emergency
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground flex-shrink-0 h-11 px-5"
                onClick={handleCallEmergency}
              >
                <Shield className="w-5 h-5 mr-2" />
                Call 112
              </Button>
            </div>

            {/* Stats (compact) */}
            <div className="mt-7 grid grid-cols-3 gap-4 sm:gap-6">
              <div className="min-w-0 text-center">
                <div className="text-xl sm:text-2xl font-bold text-foreground">24/7</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Emergency Response</div>
              </div>

              <div className="min-w-0 text-center">
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {loading ? (
                    <span className="inline-block w-10 h-6 rounded bg-gray-200 animate-pulse align-middle" />
                  ) : (
                    stats.activeVolunteers || 0
                  )}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Active Volunteers</div>
              </div>

              <div className="min-w-0 text-center">
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  {loading ? (
                    <span className="inline-block w-10 h-6 rounded bg-gray-200 animate-pulse align-middle" />
                  ) : (
                    stats.reliefCenters || 0
                  )}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Relief Centers</div>
              </div>
            </div>
          </div>

          {/* ===================== RIGHT: WEATHER ===================== */}
          <div className="min-w-0">
            <Card className="w-full bg-white rounded-xl shadow-lg border">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">
                    Live Weather & Alerts
                  </h3>
                </div>

                {/* Keep the widget within bounds */}
                <div className="w-full max-w-full">
                  <WeatherTracker compact={true} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
