import { useState, useEffect } from "react";
import { AlertTriangle, Radio, Shield, MapPin, Clock, Users, Database, CheckCircle2 } from "lucide-react";
import { alertService, type AlertSummary } from "../utils/alert-service";

export function AlertTicker() {
  const [alertSummaries, setAlertSummaries] = useState<AlertSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [systemType, setSystemType] = useState<'demo' | 'live'>('demo');

  useEffect(() => {
    loadAlerts();
    
    // Auto-refresh every 15 minutes (sync with demo rotation)
    const interval = setInterval(loadAlerts, 15 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      
      // Get system type
      const systemTypeFromService = alertService.getSystemType();
      setSystemType(systemTypeFromService);
      
      // Get deduplicated alerts for concise display
      const dedupedAlerts = await alertService.getDedupedAlerts();
      
      // Take top 6 most critical alerts for ticker
      const topAlerts = dedupedAlerts.slice(0, 6);
      
      setAlertSummaries(topAlerts);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Failed to load alerts for ticker:', error);
      // Don't clear alerts on error - keep showing last good data
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'extreme': return 'text-red-100 bg-red-600';
      case 'severe': return 'text-orange-100 bg-orange-600';
      case 'moderate': return 'text-yellow-100 bg-yellow-600';
      case 'minor': return 'text-blue-100 bg-blue-600';
      default: return 'text-gray-100 bg-gray-600';
    }
  };

  const getTickerBackgroundColor = () => {
    if (loading && alertSummaries.length === 0) return 'bg-blue-600';
    if (alertSummaries.length === 0) return 'bg-green-700';
    
    // Use the highest severity for background
    const maxSeverity = alertSummaries.reduce((max, alert) => {
      const severityOrder = { 'extreme': 4, 'severe': 3, 'moderate': 2, 'minor': 1 };
      const currentSeverity = severityOrder[alert.severity.toLowerCase() as keyof typeof severityOrder] || 0;
      const maxSeverity = severityOrder[max.toLowerCase() as keyof typeof severityOrder] || 0;
      return currentSeverity > maxSeverity ? alert.severity : max;
    }, 'minor');
    
    switch (maxSeverity.toLowerCase()) {
      case 'extreme': return 'bg-red-600';
      case 'severe': return 'bg-orange-600';
      case 'moderate': return 'bg-yellow-600';
      default: return 'bg-blue-600';
    }
  };

  const getStatusIcon = () => {
    return systemType === 'demo' ? <Shield className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />;
  };

  const getStatusText = () => {
    return systemType === 'demo' ? 'EMERGENCY DEMO' : 'LIVE NDMA';
  };

  // Show loading only on initial load
  if (loading && alertSummaries.length === 0) {
    return (
      <div className="bg-blue-600 text-white py-2">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="max-w-[1920px] mx-auto flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Initializing emergency alert system...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (alertSummaries.length === 0) {
    return (
      <div className="bg-green-700 text-white py-2">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="max-w-[1920px] mx-auto flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4" />
                <span className="text-sm">Emergency system operational • No active alerts</span>
              </div>
              <div className="flex items-center space-x-2 text-xs opacity-75">
                {getStatusIcon()}
                <span>{getStatusText()}</span>
              </div>
              <span className="text-xs opacity-75">
                Updated: {lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getTickerBackgroundColor()} text-white py-3 sticky top-0 z-50 shadow-lg`}>
      <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <div className="max-w-[1920px] mx-auto">
        <div className="flex items-center gap-4 justify-between flex-wrap">
          {/* Left Section - Alert Header */}
          <div className="flex items-center space-x-2 shrink-0">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">EMERGENCY ALERTS</span>
            <span className="text-xs opacity-75 hidden sm:inline">
              ({alertSummaries.length} active)
            </span>
          </div>
          
          {/* Center Section - Alert Summary */}
          <div className="flex items-center gap-3 flex-wrap flex-1 justify-center">
            {alertSummaries.slice(0, 3).map((summary, index) => (
              <div key={`${summary.event}-${index}`} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                <div className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityColor(summary.severity)}`}>
                  {summary.severity.toUpperCase()}
                </div>
                
                <span className="text-sm font-medium hidden sm:inline">
                  {summary.event}
                </span>
                <span className="text-sm font-medium sm:hidden">
                  {summary.event.substring(0, 15)}...
                </span>
                
                <div className="flex items-center space-x-1 text-xs opacity-75">
                  <MapPin className="w-3 h-3" />
                  <span className="hidden md:inline">{summary.areas[0]}{summary.areas.length > 1 ? ` +${summary.areas.length - 1}` : ''}</span>
                  <span className="md:hidden">{summary.count} area{summary.count > 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
            
            {alertSummaries.length > 3 && (
              <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1.5 rounded-lg">
                <Users className="w-3 h-3" />
                <span>+{alertSummaries.length - 3} more</span>
              </div>
            )}
          </div>
          
          {/* Right Section - Status */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center space-x-2 text-xs bg-white/20 px-2 py-1 rounded">
              {getStatusIcon()}
              <span className="hidden sm:inline">{getStatusText()}</span>
              <span className="sm:hidden">DEMO</span>
            </div>
            
            <div className="flex items-center space-x-1 text-xs opacity-75 hidden lg:flex">
              <Clock className="w-3 h-3" />
              <span>{lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}