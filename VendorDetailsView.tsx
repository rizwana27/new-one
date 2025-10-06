
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Star,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { Vendor } from '../../types';
import { usePurchaseOrders } from '@/hooks/useSupabaseData';
import VendorFinancialSummary from './VendorFinancialSummary';

interface VendorDetailsViewProps {
  vendor: Vendor;
  onClose: () => void;
}

const VendorDetailsView: React.FC<VendorDetailsViewProps> = ({ vendor, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch all purchase orders and filter for this vendor
  const { data: allPurchaseOrders = [] } = usePurchaseOrders();
  const vendorPOs = allPurchaseOrders.filter(po => po.vendor_id === vendor.id);
  
  const totalSpent = vendorPOs.filter(po => po.status === 'approved').reduce((sum, po) => sum + po.amount, 0);
  const pendingOrders = vendorPOs.filter(po => po.status === 'pending').length;

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getPOStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      case 'completed': return 'outline';
      default: return 'outline';
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{vendor.name}</h2>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{vendor.contactPerson}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>{vendor.rating}/5</span>
                </div>
                <Badge variant={getStatusBadgeVariant(vendor.status)}>
                  {vendor.status}
                </Badge>
              </div>
            </div>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{vendor.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{vendor.phone}</span>
                    </div>
                    {vendor.contractEndDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Contract ends: {new Date(vendor.contractEndDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Spent:</span>
                        <span className="font-semibold">${totalSpent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Pending Orders:</span>
                        <span className="font-semibold text-orange-600">{pendingOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Rating:</span>
                        <div className="flex space-x-1">
                          {getRatingStars(vendor.rating)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {vendor.services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              <VendorFinancialSummary vendor={vendor} />
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Order History</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {vendorPOs.length} total purchase orders
                  </div>
                </CardHeader>
                <CardContent>
                  {vendorPOs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No purchase orders found for this vendor</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {vendorPOs.map((po) => (
                        <div key={po.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{po.number}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{po.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>Date: {new Date(po.date).toLocaleDateString()}</span>
                                </div>
                                {po.expected_delivery && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>Expected: {new Date(po.expected_delivery).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {po.project && (
                                  <div className="flex items-center space-x-1">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span>Project: {po.project.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold">${po.amount.toLocaleString()}</div>
                              <Badge variant={getPOStatusBadgeVariant(po.status)} className="mt-1">
                                {po.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-green-600">{vendor.rating}</div>
                      <p className="text-sm text-muted-foreground">Overall Rating</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-blue-600">95%</div>
                      <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-purple-600">{vendorPOs.length}</div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contract Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Master Service Agreement</span>
                      </div>
                      <Button size="sm" variant="outline">Download</Button>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>SOW - Q4 2024</span>
                      </div>
                      <Button size="sm" variant="outline">Download</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default VendorDetailsView;
