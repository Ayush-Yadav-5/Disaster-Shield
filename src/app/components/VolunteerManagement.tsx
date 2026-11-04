import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Avatar, AvatarContent, AvatarFallback } from "./ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Mail,
  Search,
  Filter,
  Plus,
  CheckCircle,
  AlertTriangle,
  User,
  Briefcase,
  Star,
  MessageSquare,
  Navigation
} from "lucide-react";
import { toast } from "sonner";

// Mock data for volunteers
const MOCK_VOLUNTEERS = [
  {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh.kumar@email.com",
    phone: "+91-98765-43210",
    location: "Mumbai, Maharashtra",
    status: "Active",
    rating: 4.8,
    skills: ["First Aid", "Search & Rescue", "Communication"],
    certifications: ["CPR Certified", "NDRF Training"],
    languages: ["Hindi", "English", "Marathi"],
    currentTask: "Flood Relief - Patna",
    completedTasks: 24,
    availability: "Full Time"
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91-99876-54321",
    location: "Delhi, Delhi",
    status: "Available",
    rating: 4.9,
    skills: ["Medical Aid", "Counseling", "Logistics"],
    certifications: ["Nurse License", "Crisis Management"],
    languages: ["Hindi", "English", "Punjabi"],
    completedTasks: 32,
    availability: "Weekends"
  },
  {
    id: 3,
    name: "Amit Patel",
    email: "amit.patel@email.com",
    phone: "+91-97654-32109",
    location: "Ahmedabad, Gujarat",
    status: "En Route",
    rating: 4.7,
    skills: ["Heavy Machinery", "Construction", "Engineering"],
    certifications: ["Civil Engineer", "Heavy Equipment Operator"],
    languages: ["Gujarati", "Hindi", "English"],
    currentTask: "Earthquake Response - Uttarakhand",
    completedTasks: 18,
    availability: "Full Time"
  },
  {
    id: 4,
    name: "Sneha Reddy",
    email: "sneha.reddy@email.com",
    phone: "+91-96543-21098",
    location: "Hyderabad, Telangana",
    status: "Active",
    rating: 4.9,
    skills: ["Food Distribution", "Shelter Management", "Child Care"],
    certifications: ["Social Work Degree", "Child Safety Training"],
    languages: ["Telugu", "Hindi", "English"],
    currentTask: "Cyclone Relief - Visakhapatnam",
    completedTasks: 28,
    availability: "Full Time"
  },
  {
    id: 5,
    name: "Vikram Singh",
    email: "vikram.singh@email.com",
    phone: "+91-95432-10987",
    location: "Jaipur, Rajasthan",
    status: "Available",
    rating: 4.6,
    skills: ["Water Supply", "Sanitation", "Team Leadership"],
    certifications: ["Water Quality Testing", "Team Management"],
    languages: ["Hindi", "English", "Rajasthani"],
    completedTasks: 15,
    availability: "Part Time"
  }
];

// Mock data for tasks
const MOCK_TASKS = [
  {
    id: 1,
    title: "Emergency Medical Supply Distribution",
    description: "Distribute critical medical supplies to affected areas in Patna",
    location: "Patna, Bihar",
    status: "Open",
    priority: "Critical",
    estimatedHours: 8,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    requiredSkills: ["Medical Aid", "Logistics", "Communication"],
    assignedTo: null
  },
  {
    id: 2,
    title: "Search and Rescue Operations",
    description: "Conduct search and rescue operations in flood-affected regions",
    location: "Patna, Bihar",
    status: "In Progress",
    priority: "Critical",
    estimatedHours: 12,
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    requiredSkills: ["Search & Rescue", "First Aid", "Swimming"],
    assignedTo: "Rajesh Kumar & Team"
  },
  {
    id: 3,
    title: "Temporary Shelter Setup",
    description: "Set up temporary shelters for displaced families",
    location: "Visakhapatnam, Andhra Pradesh",
    status: "In Progress",
    priority: "High",
    estimatedHours: 10,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    requiredSkills: ["Construction", "Engineering", "Team Leadership"],
    assignedTo: "Amit Patel"
  },
  {
    id: 4,
    title: "Food & Water Distribution",
    description: "Organize and distribute food packets and clean water",
    location: "Uttarkashi, Uttarakhand",
    status: "Open",
    priority: "High",
    estimatedHours: 6,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    requiredSkills: ["Food Distribution", "Logistics", "Communication"],
    assignedTo: null
  },
  {
    id: 5,
    title: "Psychological Counseling",
    description: "Provide trauma counseling to disaster victims",
    location: "Chennai, Tamil Nadu",
    status: "Open",
    priority: "Medium",
    estimatedHours: 4,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    requiredSkills: ["Counseling", "Communication", "Child Care"],
    assignedTo: null
  },
  {
    id: 6,
    title: "Medical Camp Setup",
    description: "Establish mobile medical camps in remote areas",
    location: "Shimla, Himachal Pradesh",
    status: "Open",
    priority: "Medium",
    estimatedHours: 8,
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    requiredSkills: ["Medical Aid", "Logistics", "First Aid"],
    assignedTo: null
  }
];

export function VolunteerManagement() {
  const [activeTab, setActiveTab] = useState("volunteers");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVolunteer, setSelectedVolunteer] = useState<number | null>(null);
  const [volunteers, setVolunteers] = useState<any[]>(MOCK_VOLUNTEERS);
  const [tasks, setTasks] = useState<any[]>(MOCK_TASKS);
  const [showAddVolunteerDialog, setShowAddVolunteerDialog] = useState(false);
  const [newVolunteer, setNewVolunteer] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    skills: "",
    certifications: "",
    languages: "",
    availability: "Full Time"
  });

  // This will be populated with real data from your database
  useEffect(() => {
    // Fetch real volunteers from your database here
    // const fetchVolunteers = async () => {
    //   const data = await fetchVolunteersFromDatabase();
    //   setVolunteers(data);
    // };
    // fetchVolunteers();
  }, []);

  useEffect(() => {
    // Fetch real tasks from your database here
    // const fetchTasks = async () => {
    //   const data = await fetchTasksFromDatabase();
    //   setTasks(data);
    // };
    // fetchTasks();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500";
      case "En Route": return "bg-yellow-500";
      case "Available": return "bg-blue-500";
      case "Off Duty": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "text-red-600 bg-red-50 border-red-200";
      case "High": return "text-orange-600 bg-orange-50 border-orange-200";
      case "Medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "text-blue-600";
      case "Open": return "text-green-600";
      case "Completed": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = volunteer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         volunteer.skills?.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || volunteer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddVolunteer = () => {
    if (!newVolunteer.name || !newVolunteer.email || !newVolunteer.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    const volunteer = {
      id: volunteers.length + 1,
      name: newVolunteer.name,
      email: newVolunteer.email,
      phone: newVolunteer.phone,
      location: newVolunteer.location,
      status: "Available",
      rating: 0,
      skills: newVolunteer.skills.split(",").map(s => s.trim()).filter(s => s),
      certifications: newVolunteer.certifications.split(",").map(c => c.trim()).filter(c => c),
      languages: newVolunteer.languages.split(",").map(l => l.trim()).filter(l => l),
      completedTasks: 0,
      availability: newVolunteer.availability
    };

    setVolunteers([...volunteers, volunteer]);
    setShowAddVolunteerDialog(false);
    setNewVolunteer({
      name: "",
      email: "",
      phone: "",
      location: "",
      skills: "",
      certifications: "",
      languages: "",
      availability: "Full Time"
    });
    toast.success("Volunteer added successfully!");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Volunteer Management</h1>
        <p className="text-muted-foreground">Coordinate volunteers and manage emergency response tasks</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="volunteers" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Volunteers</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4" />
            <span>Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Volunteers Tab */}
        <TabsContent value="volunteers" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search volunteers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="En Route">En Route</SelectItem>
                  <SelectItem value="Off Duty">Off Duty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowAddVolunteerDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Volunteer
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Volunteer List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredVolunteers.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium text-muted-foreground mb-2">No Volunteers Found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {volunteers.length === 0 
                        ? "No volunteers have been registered yet. Add volunteers to get started."
                        : "No volunteers match your search criteria. Try adjusting your filters."}
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Volunteer
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredVolunteers.map((volunteer) => (
                  <Card 
                    key={volunteer.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedVolunteer === volunteer.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedVolunteer(volunteer.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>{volunteer.name?.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{volunteer.name}</h3>
                            <p className="text-sm text-muted-foreground">{volunteer.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={volunteer.status === 'Active' ? 'default' : 'secondary'}>
                            {volunteer.status}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{volunteer.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {volunteer.skills?.slice(0, 3).map((skill: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {volunteer.skills?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{volunteer.skills.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {volunteer.currentTask && (
                          <p className="text-sm text-blue-600">
                            Current: {volunteer.currentTask}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{volunteer.completedTasks || 0} tasks completed</span>
                          <span>{volunteer.availability}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Volunteer Details */}
            <div>
              {selectedVolunteer ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Volunteer Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const volunteer = volunteers.find(v => v.id === selectedVolunteer);
                      if (!volunteer) return null;

                      return (
                        <>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-16 h-16">
                              <AvatarFallback className="text-lg">
                                {volunteer.name?.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{volunteer.name}</h3>
                              <Badge variant={volunteer.status === 'Active' ? 'default' : 'secondary'}>
                                {volunteer.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{volunteer.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{volunteer.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{volunteer.location}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Skills & Certifications</Label>
                            <div className="flex flex-wrap gap-1">
                              {volunteer.skills?.map((skill: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {volunteer.certifications?.map((cert: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Languages</Label>
                            <div className="flex flex-wrap gap-1">
                              {volunteer.languages?.map((lang: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 space-y-2">
                            <Button className="w-full" size="sm">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Contact Volunteer
                            </Button>
                            <Button variant="outline" className="w-full" size="sm">
                              <Navigation className="w-4 h-4 mr-2" />
                              Assign Task
                            </Button>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a volunteer to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Emergency Tasks</h2>
              <p className="text-sm text-muted-foreground">
                {tasks.filter(t => t.status === 'Open').length} open tasks, {tasks.filter(t => t.status === 'In Progress').length} in progress
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tasks.length === 0 ? (
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium text-muted-foreground mb-2">No Tasks Available</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No emergency tasks have been created yet. Create tasks to assign to volunteers.
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Task
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              tasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <span className={`text-sm font-medium ${getTaskStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{task.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{task.estimatedHours}h estimated • Due: {new Date(task.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Required Skills</Label>
                      <div className="flex flex-wrap gap-1">
                        {task.requiredSkills?.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {task.assignedTo ? (
                      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">Assigned to {task.assignedTo}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          Contact
                        </Button>
                      </div>
                    ) : (
                      <Button className="w-full" size="sm">
                        <User className="w-4 h-4 mr-2" />
                        Assign Volunteer
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No schedule data available</p>
                  <p className="text-xs text-muted-foreground mt-1">Schedule will populate when volunteers are assigned to shifts</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Shifts</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No shifts scheduled</p>
                <p className="text-xs text-muted-foreground mt-1">Create shifts when volunteers are available</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{volunteers.length}</p>
                    <p className="text-sm text-muted-foreground">Total Volunteers</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{volunteers.filter(v => v.status === 'Active').length}</p>
                    <p className="text-sm text-muted-foreground">Active Now</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{tasks.filter(t => t.status === 'Open').length}</p>
                    <p className="text-sm text-muted-foreground">Open Tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">-</p>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8 text-muted-foreground">
                <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No performance data available</p>
                <p className="text-xs text-muted-foreground mt-1">Data will appear as volunteers complete tasks</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skill Distribution</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No skill data available</p>
                <p className="text-xs text-muted-foreground mt-1">Skills will be tracked as volunteers are added</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Volunteer Dialog */}
      <Dialog open={showAddVolunteerDialog} onOpenChange={setShowAddVolunteerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Volunteer</DialogTitle>
            <DialogDescription>
              Enter the details of the new volunteer to add them to the system.
            </DialogDescription>
          </DialogHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="Enter volunteer's name"
                value={newVolunteer.name}
                onChange={(e) => setNewVolunteer({ ...newVolunteer, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Email</Label>
              <Input
                placeholder="Enter volunteer's email"
                value={newVolunteer.email}
                onChange={(e) => setNewVolunteer({ ...newVolunteer, email: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Phone</Label>
              <Input
                placeholder="Enter volunteer's phone number"
                value={newVolunteer.phone}
                onChange={(e) => setNewVolunteer({ ...newVolunteer, phone: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="Enter volunteer's location"
                value={newVolunteer.location}
                onChange={(e) => setNewVolunteer({ ...newVolunteer, location: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Skills</Label>
              <Input
                placeholder="Enter skills separated by commas"
                value={newVolunteer.skills}
                onChange={(e) => setNewVolunteer({ ...newVolunteer, skills: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Certifications</Label>
              <Input
                placeholder="Enter certifications separated by commas"
                value={newVolunteer.certifications}
                onChange={(e) => setNewVolunteer({ ...newVolunteer, certifications: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Languages</Label>
              <Input
                placeholder="Enter languages separated by commas"
                value={newVolunteer.languages}
                onChange={(e) => setNewVolunteer({ ...newVolunteer, languages: e.target.value })}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Availability</Label>
              <Select value={newVolunteer.availability} onValueChange={(value) => setNewVolunteer({ ...newVolunteer, availability: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Time">Full Time</SelectItem>
                  <SelectItem value="Part Time">Part Time</SelectItem>
                  <SelectItem value="Weekends">Weekends</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setShowAddVolunteerDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVolunteer}>
              Add Volunteer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}