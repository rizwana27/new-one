
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Users, 
  Plus,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import { mockVendors, mockResources } from '../../data/mockData';
import { useToast } from "@/hooks/use-toast";
import AddSubcontractorForm from './AddSubcontractorForm';
import EditSubcontractorForm from './EditSubcontractorForm';
import ResourceDetailsModal from './ResourceDetailsModal';
import AssignToProjectModal from './AssignToProjectModal';

const VendorResourceIntegration: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [resources, setResources] = useState(mockResources);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const { toast } = useToast();

  // Filter subcontractor resources
  const subcontractorResources = resources.filter(resource => resource.isSubcontractor);
  
  const filteredResources = subcontractorResources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVendor = selectedVendor === 'all' || resource.vendorId === selectedVendor;
    return matchesSearch && matchesVendor;
  });

  const handleAddSubcontractor = (resourceData: any) => {
    const newResource = {
      ...resourceData,
      id: `subcontractor-${Date.now()}`,
    };
    setResources([...resources, newResource]);
    toast({
      title: "Subcontractor Added",
      description: `${resourceData.name} has been added successfully.`,
    });
  };

  const handleEditResource = (resourceData: any) => {
    setResources(resources.map(r => 
      r.id === resourceData.id ? resourceData : r
    ));
    toast({
      title: "Subcontractor Updated",
      description: `${resourceData.name} has been updated successfully.`,
    });
  };

  const handleDeleteResource = () => {
    if (selectedResource) {
      setResources(resources.filter(r => r.id !== selectedResource.id));
      toast({
        title: "Subcontractor Removed",
        description: `${selectedResource.name} has been removed from the system.`,
      });
      setSelectedResource(null);
      setShowDeleteDialog(false);
    }
  };

  const handleAssignToProject = (assignmentData: any) => {
    // In a real app, this would create a project assignment
    //console.log('Assignment data:', assignmentData);
    toast({
      title: "Resource Assigned",
      description: `${assignmentData.resourceName} has been assigned to the project.`,
    });
  };

  const getVendorName = (vendorId?: string) => {
    if (!vendorId) return 'Unassigned';
    const vendor = mockVendors.find(v => v.id === vendorId);
    return vendor?.name || 'Unknown Vendor';
  };

  const getVendorData = (vendorId?: string) => {
    return mockVendors.find(v => v.id === vendorId);
  };

  const getResourceUtilization = (resourceId: string) => {
    // Mock calculation based on project allocations
    return Math.floor(Math.random() * 40) + 60; // 60-100%
  };

  const openEditForm = (resource: any) => {
    setSelectedResource(resource);
    setShowEditForm(true);
  };

  const openDetailsModal = (resource: any) => {
    setSelectedResource(resource);
    setShowDetailsModal(true);
  };

  const openAssignModal = (resource: any) => {
    setSelectedResource(resource);
    setShowAssignModal(true);
  };

  const openDeleteDialog = (resource: any) => {
    setSelectedResource(resource);
    setShowDeleteDialog(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Vendor Resource Management</CardTitle>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subcontractor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search Resources</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="vendor-filter">Filter by Vendor</Label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger>
                  <SelectValue placeholder="All vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All vendors</SelectItem>
                  {mockVendors.map(vendor => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => {
              const utilization = getResourceUtilization(resource.id);
              const isHighUtilization = utilization > 85;
              
              return (
                <Card key={resource.id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{resource.name}</h4>
                        <p className="text-sm text-muted-foreground">{resource.role}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openEditForm(resource)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openDeleteDialog(resource)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Vendor:</span>
                      <p className="text-sm text-muted-foreground">
                        {getVendorName(resource.vendorId)}
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium">Rate:</span>
                      <p className="text-sm">${resource.hourlyRate}/hour</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Utilization:</span>
                        <Badge variant={isHighUtilization ? "destructive" : "default"}>
                          {utilization}%
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${isHighUtilization ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${utilization}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium">Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {resource.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {resource.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{resource.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openAssignModal(resource)}
                      >
                        <Users className="h-3 w-3 mr-1" />
                        Assign
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openDetailsModal(resource)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {selectedVendor === 'all' 
                  ? 'No subcontractor resources found' 
                  : `No subcontractor resources found for ${getVendorName(selectedVendor)}`
                }
              </p>
              <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Subcontractor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Subcontractor Form */}
      <AddSubcontractorForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        vendors={mockVendors}
        onSubmit={handleAddSubcontractor}
      />

      {/* Edit Subcontractor Form */}
      <EditSubcontractorForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        resource={selectedResource}
        vendors={mockVendors}
        onSubmit={handleEditResource}
      />

      {/* Resource Details Modal */}
      <ResourceDetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        resource={selectedResource}
        vendor={getVendorData(selectedResource?.vendorId)}
      />

      {/* Assign to Project Modal */}
      <AssignToProjectModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        resource={selectedResource}
        onSubmit={handleAssignToProject}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subcontractor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedResource?.name} from the system? 
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteResource}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorResourceIntegration;
