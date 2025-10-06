import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Mail, Phone, Globe, MapPin } from "lucide-react";
import EditVendorForm from "./EditVendorForm";

export interface Vendor {
  id: string;
  name: string;
  legal_name: string;
  dba_name?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  status: "active" | "inactive" | "preferred";
}

interface VendorsOverviewProps {
  vendors: Vendor[];
  onViewDetails?: (vendor: Vendor) => void;
  onVendorsUpdate?: (updatedVendor: Vendor) => void;
}

const VendorsOverview: React.FC<VendorsOverviewProps> = ({
  vendors = [],
  onViewDetails,
  onVendorsUpdate,
}) => {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-600 text-white";
      case "inactive":
        return "bg-gray-600 text-white";
      case "preferred":
        return "bg-blue-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const handleEditClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsEditOpen(true);
  };

  const handleVendorUpdate = (updatedData: Partial<Vendor>) => {
    if (selectedVendor && onVendorsUpdate) {
      onVendorsUpdate({ ...selectedVendor, ...updatedData });
    }
    setIsEditOpen(false);
    setSelectedVendor(null);
  };

  return (
    <div className="space-y-6">
      {/* Vendor Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {vendors.filter((v) => v.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Preferred</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {vendors.filter((v) => v.status === "preferred").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor List */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 👇 3 in a row on large screens, 2 on md, 1 on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((vendor) => (
              <Card key={vendor.id} className="h-full">
                <CardContent className="p-4 h-full">
                  <div className="flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">{vendor.name}</h3>
                        <Badge className={getStatusColor(vendor.status)}>
                          {vendor.status}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                          <strong>Legal Name:</strong> {vendor.legal_name}
                        </div>
                        {vendor.dba_name && (
                          <div>
                            <strong>DBA:</strong> {vendor.dba_name}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{vendor.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{vendor.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{vendor.email}</span>
                        </div>
                        {vendor.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <a
                              href={vendor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline"
                            >
                              {vendor.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      {onViewDetails && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(vendor)}
                        >
                          View
                        </Button>
                      )}
                      <Button size="sm" onClick={() => handleEditClick(vendor)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <EditVendorForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        vendor={selectedVendor}
        onSubmit={handleVendorUpdate}
      />
    </div>
  );
};

export default VendorsOverview;
