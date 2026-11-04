import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  Heart, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Package,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  CreditCard,
  Smartphone,
  Globe,
  Building
} from "lucide-react";
import { toast } from "sonner";

// Mock donation campaigns data
const MOCK_CAMPAIGNS = [
  {
    id: 1,
    title: "Bihar Flood Relief 2024",
    description: "Emergency relief for flood-affected families in Patna and surrounding districts",
    raised: 2450000,
    goal: 5000000,
    donors: 1240,
    urgent: true
  },
  {
    id: 2,
    title: "Uttarakhand Earthquake Response",
    description: "Immediate support for earthquake victims in Himalayan regions",
    raised: 1850000,
    goal: 3000000,
    donors: 890,
    urgent: true
  },
  {
    id: 3,
    title: "Cyclone Relief - East Coast",
    description: "Rebuilding homes and providing essentials to cyclone-affected communities",
    raised: 3200000,
    goal: 4000000,
    donors: 1560,
    urgent: false
  },
  {
    id: 4,
    title: "Wildfire Emergency Response",
    description: "Support firefighting efforts and displaced families in Karnataka",
    raised: 980000,
    goal: 2000000,
    donors: 456,
    urgent: true
  },
  {
    id: 5,
    title: "Heatwave Relief Operations",
    description: "Providing water, cooling centers, and medical aid in Rajasthan",
    raised: 1250000,
    goal: 1500000,
    donors: 678,
    urgent: false
  },
  {
    id: 6,
    title: "Landslide Recovery - Himachal",
    description: "Clearing roads and supporting affected families in hill regions",
    raised: 750000,
    goal: 1200000,
    donors: 345,
    urgent: false
  }
];

export function Donations() {
  const [donationGoals, setDonationGoals] = useState<any[]>(MOCK_CAMPAIGNS);
  const [impactStats, setImpactStats] = useState({
    livesSupported: 45680,
    emergencyKits: 12340,
    reliefOperations: 156,
    countriesReached: 8
  });
  const [showDonationDialog, setShowDonationDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donationType, setDonationType] = useState<"one-time" | "monthly">("one-time");

  // This will be populated with real data from your database
  useEffect(() => {
    // Fetch real donation campaigns from your database here
    // const fetchDonationGoals = async () => {
    //   const data = await fetchDonationCampaigns();
    //   setDonationGoals(data);
    // };
    // fetchDonationGoals();
  }, []);

  useEffect(() => {
    // Fetch real impact statistics from your database here
    // const fetchImpactStats = async () => {
    //   const data = await fetchImpactStatistics();
    //   setImpactStats(data);
    // };
    // fetchImpactStats();
  }, []);

  const donationMethods = [
    {
      title: "One-Time Donation",
      description: "Make an immediate impact with a single donation",
      icon: Heart,
      amounts: [25, 50, 100, 250],
      type: "one-time" as const
    },
    {
      title: "Monthly Giving",
      description: "Provide sustained support with recurring donations",
      icon: TrendingUp,
      amounts: [10, 25, 50, 100],
      type: "monthly" as const
    },
    {
      title: "Corporate Partnership",
      description: "Partner with us for large-scale disaster response",
      icon: Building,
      amounts: [1000, 5000, 10000, 25000],
      type: "corporate" as const
    }
  ];

  const impactStatsDisplay = [
    { label: "Lives Supported", value: impactStats.livesSupported || 0, icon: Users },
    { label: "Emergency Kits Distributed", value: impactStats.emergencyKits || 0, icon: Package },
    { label: "Relief Operations Funded", value: impactStats.reliefOperations || 0, icon: Shield },
    { label: "Countries Reached", value: impactStats.countriesReached || 0, icon: Globe }
  ];

  const handleDonateClick = (campaign?: any, amount?: number, type?: "one-time" | "monthly") => {
    setSelectedCampaign(campaign || null);
    setDonationAmount(amount?.toString() || "");
    setDonationType(type || "one-time");
    setShowDonationDialog(true);
  };

  const handleSubmitDonation = () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }

    if (!donorName || !donorEmail) {
      toast.error("Please fill in your name and email");
      return;
    }

    // Here you would integrate with a payment gateway
    // For now, we'll simulate a successful donation
    const amount = parseFloat(donationAmount);
    
    // Update campaign if specific campaign selected
    if (selectedCampaign) {
      setDonationGoals(prev => prev.map(campaign => 
        campaign.id === selectedCampaign.id 
          ? { ...campaign, raised: campaign.raised + amount, donors: campaign.donors + 1 }
          : campaign
      ));
    }

    // Update impact stats
    setImpactStats(prev => ({
      ...prev,
      livesSupported: prev.livesSupported + Math.floor(amount / 100),
      emergencyKits: prev.emergencyKits + Math.floor(amount / 500)
    }));

    toast.success(
      `Thank you for your ₹${amount.toLocaleString()} ${donationType} donation!`,
      {
        description: selectedCampaign 
          ? `Your contribution will support ${selectedCampaign.title}` 
          : "Your contribution will support disaster relief efforts"
      }
    );

    // Reset form
    setShowDonationDialog(false);
    setDonationAmount("");
    setDonorName("");
    setDonorEmail("");
    setSelectedCampaign(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Support Disaster Relief Efforts
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your donation provides immediate aid to disaster victims and helps build resilient communities worldwide.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>100% Transparent</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span>Immediate Impact</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Impact Statistics */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Your Impact So Far</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStatsDisplay.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <IconComponent className="w-8 h-8 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-primary mb-1">
                      {stat.value.toLocaleString() || "-"}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Active Campaigns</h2>
            <Badge variant="destructive" className="text-sm">
              {donationGoals.filter(c => c.urgent).length} Urgent Campaigns
            </Badge>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {donationGoals.length === 0 ? (
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium text-muted-foreground mb-2">No Active Campaigns</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No donation campaigns are currently active. New campaigns will appear here when disasters occur.
                    </p>
                    <Button>
                      <Heart className="w-4 h-4 mr-2" />
                      Make General Donation
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              donationGoals.map((campaign) => (
                <Card key={campaign.id} className={`relative ${campaign.urgent ? 'ring-2 ring-red-200' : ''}`}>
                  {campaign.urgent && (
                    <Badge variant="destructive" className="absolute -top-2 left-4 z-10">
                      Urgent
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{campaign.title}</span>
                      <Heart className="w-5 h-5 text-red-500" />
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{campaign.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">${campaign.raised?.toLocaleString() || 0} raised</span>
                        <span className="text-muted-foreground">of ${campaign.goal?.toLocaleString() || 0}</span>
                      </div>
                      <Progress value={(campaign.raised / campaign.goal) * 100 || 0} className="h-3" />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{campaign.donors || 0} donors</span>
                      </div>
                      <span className="text-muted-foreground">
                        {Math.round(((campaign.raised || 0) / (campaign.goal || 1)) * 100)}% funded
                      </span>
                    </div>
                    
                    <Button className="w-full" variant={campaign.urgent ? "default" : "outline"} onClick={() => handleDonateClick(campaign)}>
                      <Heart className="w-4 h-4 mr-2" />
                      Donate Now
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Donation Methods */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Ways to Give</h2>
          <div className="grid lg:grid-cols-3 gap-8">
            {donationMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <IconComponent className="w-12 h-12 text-primary mx-auto mb-4" />
                    <CardTitle>{method.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {method.amounts.map((amount) => (
                        <Button key={amount} variant="outline" className="text-sm" onClick={() => handleDonateClick(null, amount, method.type)}>
                          ${amount}
                        </Button>
                      ))}
                    </div>
                    <Button className="w-full" onClick={() => handleDonateClick(null, undefined, method.type)}>
                      Choose Amount
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Secure & Convenient Payment</h3>
              <p className="text-muted-foreground mb-6">
                We accept all major payment methods with bank-level security
              </p>
              <div className="flex items-center justify-center space-x-6 mb-6">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium">Cards</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium">Mobile Pay</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Globe className="w-6 h-6 text-purple-600" />
                  <span className="text-sm font-medium">Bank Transfer</span>
                </div>
              </div>
              <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => handleDonateClick()}>
                <DollarSign className="w-5 h-5 mr-2" />
                Donate Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Transparency Section */}
        <div className="bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Complete Transparency</h3>
            <p className="text-muted-foreground mb-8">
              Track exactly how your donation is used with our blockchain-powered transparency system. 
              Every dollar is accounted for and you can see the real impact of your contribution.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="bg-white rounded-lg p-6">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Real-time Tracking</h4>
                <p className="text-muted-foreground">See where your money goes in real-time</p>
              </div>
              <div className="bg-white rounded-lg p-6">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Verified Impact</h4>
                <p className="text-muted-foreground">All relief efforts are documented and verified</p>
              </div>
              <div className="bg-white rounded-lg p-6">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Regular Reports</h4>
                <p className="text-muted-foreground">Quarterly impact reports sent to all donors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Dialog */}
      <Dialog open={showDonationDialog} onOpenChange={setShowDonationDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Make a Donation</DialogTitle>
            <DialogDescription>
              {selectedCampaign ? `Support ${selectedCampaign.title}` : "Support disaster relief efforts"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Donation Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
              />
            </div>
          </div>
          <Button className="mt-4" onClick={handleSubmitDonation}>
            <DollarSign className="w-4 h-4 mr-2" />
            Donate Now
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}