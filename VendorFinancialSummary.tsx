
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Clock,
  FileText
} from 'lucide-react';
import { Vendor, PurchaseOrder, Invoice } from '../../types';
import { mockPurchaseOrders, mockInvoices } from '../../data/mockData';

interface VendorFinancialSummaryProps {
  vendor: Vendor;
}

const VendorFinancialSummary: React.FC<VendorFinancialSummaryProps> = ({ vendor }) => {
  const vendorPOs = mockPurchaseOrders.filter(po => po.vendor_id === vendor.id);
  const approvedPOs = vendorPOs.filter(po => po.status === 'approved');
  const pendingPOs = vendorPOs.filter(po => po.status === 'pending');
  
  const totalSpent = approvedPOs.reduce((sum, po) => sum + po.amount, 0);
  const pendingAmount = pendingPOs.reduce((sum, po) => sum + po.amount, 0);
  
  const getPaymentStatus = () => {
    if (pendingPOs.length > 3) return { status: 'High', color: 'text-red-600', icon: AlertCircle };
    if (pendingPOs.length > 1) return { status: 'Medium', color: 'text-orange-600', icon: Clock };
    return { status: 'Low', color: 'text-green-600', icon: TrendingUp };
  };

  const paymentStatus = getPaymentStatus();
  const StatusIcon = paymentStatus.icon;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{approvedPOs.length} approved orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{pendingPOs.length} pending orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${vendorPOs.length > 0 ? Math.round(totalSpent / vendorPOs.length).toLocaleString() : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Per purchase order</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <StatusIcon className={`h-4 w-4 ${paymentStatus.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${paymentStatus.color}`}>{paymentStatus.status}</div>
            <p className="text-xs text-muted-foreground">Based on pending orders</p>
          </CardContent>
        </Card>
      </div>

      {pendingPOs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Pending Purchase Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingPOs.map((po) => (
                <div key={po.id} className="flex justify-between items-center p-3 border border-orange-200 rounded bg-orange-50">
                  <div>
                    <span className="font-medium text-orange-900">{po.number}</span>
                    <span className="text-sm text-orange-700 ml-2">
                      Expected: {po.expected_delivery ? new Date(po.expected_delivery).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-orange-900">${po.amount.toLocaleString()}</span>
                    <Badge variant="secondary">Pending</Badge>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorFinancialSummary;
