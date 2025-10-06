
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Mail, DollarSign, Clock, Building2, Calendar } from "lucide-react";

interface ResourceDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: any;
  vendor?: any;
}

const ResourceDetailsModal: React.FC<ResourceDetailsModalProps> = ({
  open,
  onOpenChange,
  resource,
  vendor
}) => {
  if (!resource) return null;

  const utilization = Math.floor(Math.random() * 40) + 60; // Mock utilization
  const isHighUtilization = utilization > 85;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Subcontractor Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={resource.avatar} />
              <AvatarFallback>{resource.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{resource.name}</h2>
              <p className="text-lg text-muted-foreground">{resource.role}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{resource.email}</span>
              </div>
            </div>
            <Badge variant={resource.isActive ? "default" : "secondary"}>
              {resource.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          <Separator />

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="font-medium">Vendor:</span>
                  <p className="text-muted-foreground">{vendor?.name || 'Unassigned'}</p>
                </div>
                <div>
                  <span className="font-medium">Department:</span>
                  <p className="text-muted-foreground">{resource.department}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge variant={resource.isActive ? "default" : "secondary"}>
                    {resource.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Financial Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="font-medium">Hourly Rate:</span>
                  <p className="text-muted-foreground">${resource.hourlyRate}/hour</p>
                </div>
                <div>
                  <span className="font-medium">Weekly Capacity:</span>
                  <p className="text-muted-foreground">{resource.capacity} hours</p>
                </div>
                <div>
                  <span className="font-medium">Current Utilization:</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={isHighUtilization ? "destructive" : "default"}>
                      {utilization}%
                    </Badge>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${isHighUtilization ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${utilization}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Section */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {resource.skills.map((skill: string) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last project assignment</span>
                  <span className="text-sm text-muted-foreground">2 days ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Profile updated</span>
                  <span className="text-sm text-muted-foreground">1 week ago</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Contract renewed</span>
                  <span className="text-sm text-muted-foreground">1 month ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bill Rates History */}
          <Card>
            <CardHeader>
              <CardTitle>Rate History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resource.billRates.map((rate: any) => (
                  <div key={rate.id} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">${rate.rate}/hour</span>
                      <p className="text-sm text-muted-foreground">{rate.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Effective: {rate.effectiveDate}</p>
                      <Badge variant={rate.isActive ? "default" : "secondary"} className="text-xs">
                        {rate.isActive ? "Current" : "Historical"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceDetailsModal;
