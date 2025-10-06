
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar } from 'lucide-react';
import { Vendor } from '../../types';

interface ContractManagementProps {
  vendors: Vendor[];
}

const ContractManagement: React.FC<ContractManagementProps> = ({ vendors }) => {
  const contractsWithDates = vendors.filter(v => v.contractEndDate);
  
  const getContractStatus = (endDate: string) => {
    const today = new Date();
    const contractEnd = new Date(endDate);
    const daysUntilExpiry = Math.ceil((contractEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'expired', color: 'bg-red-500', days: daysUntilExpiry };
    if (daysUntilExpiry <= 30) return { status: 'expiring-soon', color: 'bg-orange-500', days: daysUntilExpiry };
    if (daysUntilExpiry <= 90) return { status: 'expiring', color: 'bg-yellow-500', days: daysUntilExpiry };
    return { status: 'active', color: 'bg-green-500', days: daysUntilExpiry };
  };

  const expiringContracts = contractsWithDates.filter(v => {
    const status = getContractStatus(v.contractEndDate!);
    return status.status === 'expiring-soon' || status.status === 'expired';
  });

  return (
    <div className="space-y-6">
      {/* Alert for expiring contracts */}
      {expiringContracts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Contract Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-3">
              {expiringContracts.length} contract(s) require attention
            </p>
            <div className="space-y-2">
              {expiringContracts.map((vendor) => {
                const status = getContractStatus(vendor.contractEndDate!);
                return (
                  <div key={vendor.id} className="flex items-center justify-between bg-white p-3 rounded">
                    <span className="font-medium">{vendor.name}</span>
                    <Badge variant="destructive">
                      {status.status === 'expired' ? 'Expired' : `Expires in ${status.days} days`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Contracts */}
      <Card>
        <CardHeader>
          <CardTitle>All Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contractsWithDates.map((vendor) => {
              const status = getContractStatus(vendor.contractEndDate!);
              
              return (
                <div key={vendor.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{vendor.name}</h3>
                      <p className="text-sm text-muted-foreground">{vendor.contactPerson}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Expires: {new Date(vendor.contractEndDate!).toLocaleDateString()}
                        </div>
                        <div>Services: {vendor.services.join(', ')}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={status.color}>
                        {status.status === 'expired' ? 'Expired' : 
                         status.status === 'expiring-soon' ? 'Expiring Soon' :
                         status.status === 'expiring' ? 'Expiring' : 'Active'}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        {status.days > 0 ? `${status.days} days remaining` : `Expired ${Math.abs(status.days)} days ago`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractManagement;
