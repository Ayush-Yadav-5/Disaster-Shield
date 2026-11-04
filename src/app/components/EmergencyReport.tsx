import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
import { 
  AlertTriangle, 
  Camera, 
  MapPin, 
  Clock, 
  User, 
  Phone,
  Upload,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { AuthenticatedOnly } from "./ProtectedRoute";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner";

export function EmergencyReport() {
  const { user, session } = useAuth();
  const [formStep, setFormStep] = useState(1);
  const [isQuickReport, setIsQuickReport] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState("");
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    type: "",
    severity: "",
    location: "",
    coordinates: { lat: 0, lng: 0 },
    description: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    witnessCount: "",
    injuries: false,
    images: [] as File[]
  });

  // Fetch recent reports from database
  useEffect(() => {
    // const fetchRecentReports = async () => {
    //   try {
    //     const response = await fetch('/api/reports/recent');
    //     const data = await response.json();
    //     setRecentReports(data || []);
    //   } catch (error) {
    //     console.error('Error fetching recent reports:', error);
    //   }
    // };
    // fetchRecentReports();
  }, []);

  const emergencyTypes = [
    "Fire", "Medical Emergency", "Flood", "Earthquake", "Power Outage", 
    "Gas Leak", "Building Collapse", "Traffic Accident", "Chemical Spill", "Other"
  ];

  const severityLevels = [
    { value: "critical", label: "Critical - Immediate threat to life", color: "text-red-600" },
    { value: "high", label: "High - Serious situation requiring urgent response", color: "text-orange-600" },
    { value: "medium", label: "Medium - Significant incident requiring attention", color: "text-yellow-600" },
    { value: "low", label: "Low - Minor incident for monitoring", color: "text-green-600" }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    
    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleSubmit = async () => {
    if (!formData.type || !formData.severity || !formData.location || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-3f6e5e28`;
      
      const reportData = {
        type: formData.type,
        severity: formData.severity,
        location: formData.location,
        coordinates: formData.coordinates,
        description: formData.description,
        reportedBy: isAnonymous ? 'Anonymous' : (user?.name || formData.contactName || 'Unknown'),
        contact: !isAnonymous ? {
          name: formData.contactName || user?.name,
          phone: formData.contactPhone || user?.phone,
          email: formData.contactEmail || user?.email
        } : undefined,
        witnessCount: parseInt(formData.witnessCount) || 0,
        hasInjuries: formData.injuries,
        radius: formData.severity === 'critical' ? 1000 : formData.severity === 'high' ? 800 : 500
      };

      const authToken = session?.access_token || publicAnonKey;
      
      const response = await fetch(`${API_BASE}/incidents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      });

      const result = await response.json();

      if (result.success) {
        setSubmittedReportId(result.data.id);
        setFormStep(4); // Success step
        toast.success("Emergency report submitted successfully!");
        
        // Reset form
        setFormData({
          type: "",
          severity: "",
          location: "",
          coordinates: { lat: 0, lng: 0 },
          description: "",
          contactName: "",
          contactPhone: "",
          contactEmail: "",
          witnessCount: "",
          injuries: false,
          images: []
        });
      } else {
        throw new Error(result.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          toast.success("Location captured successfully");
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error("Could not get current location");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Under Investigation": return "text-blue-600";
      case "Response Dispatched": return "text-red-600";
      case "Monitoring": return "text-orange-600";
      case "Resolved": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  if (formStep === 4) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center">
          <CardContent className="py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Report Submitted Successfully</h2>
            <p className="text-muted-foreground mb-6">
              Your emergency report has been received and assigned ID: <strong>{submittedReportId}</strong>
            </p>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Emergency services have been notified and will respond according to the severity level.
                  You may receive a follow-up call for additional information.
                </AlertDescription>
              </Alert>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setFormStep(1)}>Submit Another Report</Button>
                <Button variant="outline">Track This Report</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <span>Emergency Report</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={isQuickReport ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsQuickReport(true)}
                  >
                    Quick Report
                  </Button>
                  <Button
                    variant={!isQuickReport ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsQuickReport(false)}
                  >
                    Detailed Report
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {isQuickReport 
                  ? "Report an emergency quickly with essential information" 
                  : "Provide comprehensive details for thorough incident documentation"
                }
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress indicator for detailed report */}
              {!isQuickReport && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Step {formStep} of 3</span>
                    <span>{Math.round((formStep / 3) * 100)}% Complete</span>
                  </div>
                  <Progress value={(formStep / 3) * 100} />
                </div>
              )}

              {/* Step 1: Basic Information */}
              {(isQuickReport || formStep === 1) && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency-type">Emergency Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select emergency type" />
                        </SelectTrigger>
                        <SelectContent>
                          {emergencyTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="severity">Severity Level *</Label>
                      <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          {severityLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <span className={level.color}>{level.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="location"
                        placeholder="Enter address or describe location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        onClick={getCurrentLocation}
                        title="Use current location"
                      >
                        <MapPin className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the emergency situation..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="injuries"
                      checked={formData.injuries}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, injuries: checked as boolean }))}
                    />
                    <Label htmlFor="injuries">There are injuries reported</Label>
                  </div>

                  {isQuickReport && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="anonymous"
                        checked={isAnonymous}
                        onCheckedChange={setIsAnonymous}
                      />
                      <Label htmlFor="anonymous" className="flex items-center space-x-1">
                        {isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>Submit anonymously</span>
                      </Label>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Contact Information (detailed report only) */}
              {!isQuickReport && formStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="anonymous-detailed"
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                    />
                    <Label htmlFor="anonymous-detailed">Submit anonymously</Label>
                  </div>

                  {!isAnonymous && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Your Name</Label>
                        <Input
                          id="contact-name"
                          placeholder="Enter your full name"
                          value={formData.contactName}
                          onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact-phone">Phone Number</Label>
                          <Input
                            id="contact-phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={formData.contactPhone}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact-email">Email Address</Label>
                          <Input
                            id="contact-email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.contactEmail}
                            onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="witness-count">Number of Witnesses</Label>
                    <Input
                      id="witness-count"
                      type="number"
                      placeholder="0"
                      value={formData.witnessCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, witnessCount: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Media Upload (detailed report only) */}
              {!isQuickReport && formStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Photo/Video Evidence</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Upload photos or videos to help emergency responders understand the situation better
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Label htmlFor="file-upload">
                        <Button type="button" variant="outline" asChild>
                          <span className="cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Files
                          </span>
                        </Button>
                      </Label>
                    </div>

                    {formData.images.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Uploaded Files:</p>
                        {formData.images.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm">{file.name}</span>
                            <Button variant="ghost" size="sm">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        {uploadProgress < 100 && (
                          <Progress value={uploadProgress} className="w-full" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                {!isQuickReport && formStep > 1 && (
                  <Button variant="outline" onClick={() => setFormStep(formStep - 1)}>
                    Previous
                  </Button>
                )}
                
                <div className="ml-auto">
                  {isQuickReport ? (
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Report
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      {formStep < 3 ? (
                        <Button onClick={() => setFormStep(formStep + 1)}>
                          Next
                        </Button>
                      ) : (
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Submit Report
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Recent Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No recent reports</p>
                  <p className="text-xs text-muted-foreground mt-1">Recent reports will appear here</p>
                </div>
              ) : (
                recentReports.map((report) => (
                  <div key={report.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={report.severity === 'Critical' ? 'destructive' : 'secondary'}>
                        {report.severity}
                      </Badge>
                      {report.verified && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <h4 className="font-medium text-sm">{report.type}</h4>
                    <p className="text-xs text-muted-foreground">{report.location}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className={getStatusColor(report.status)}>{report.status}</span>
                      <span className="text-muted-foreground">{report.timeAgo}</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-2 bg-red-50 border border-red-200 rounded">
                <Phone className="w-4 h-4 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Emergency Services</p>
                  <p className="text-sm text-red-700">112</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 border rounded">
                <Phone className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-medium">NDRF Rescue Team</p>
                  <p className="text-sm text-muted-foreground">+91-9711077372</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 border rounded">
                <Phone className="w-4 h-4 text-green-600" />
                <div>
                  <p className="font-medium">Control Room (24x7)</p>
                  <p className="text-sm text-muted-foreground">+91-11-26701728</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 border rounded">
                <Phone className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="font-medium">Information (9:30AM-6PM)</p>
                  <p className="text-sm text-muted-foreground">+91-11-26701700</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}