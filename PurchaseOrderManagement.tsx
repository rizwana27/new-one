
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import NewPurchaseOrderForm from './NewPurchaseOrderForm';
import EditPurchaseOrderForm from './EditPurchaseOrderForm';
import PurchaseOrderSummaryCards from './po/PurchaseOrderSummaryCards';
import PurchaseOrderFilters from './po/PurchaseOrderFilters';
import PurchaseOrderList from './po/PurchaseOrderList';
import { PurchaseOrder } from '@/types';

interface PurchaseOrderManagementProps {
  vendors: any[];
  purchaseOrders: PurchaseOrder[];
  onAddPO: (poData: any) => void;
  onEditPO: (poData: any) => void;
  onUpdatePOStatus: (poId: string, status: string) => void;
}

const PurchaseOrderManagement: React.FC<PurchaseOrderManagementProps> = ({
  vendors,
  purchaseOrders,
  onAddPO,
  onEditPO,
  onUpdatePOStatus
}) => {
  const [showNewPOForm, setShowNewPOForm] = useState(false);
  const [showEditPOForm, setShowEditPOForm] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const getVendorName = (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.name : 'Unknown Vendor';
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const vendorName = po.vendor?.name || getVendorName(po.vendor_id);
    const matchesSearch = vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (poId: string, newStatus: string) => {
    onUpdatePOStatus(poId, newStatus);
    toast({
      title: "Status Updated",
      description: `Purchase order status changed to ${newStatus}.`,
    });
  };

  const openEditPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setShowEditPOForm(true);
  };

  const handleEditPO = (poData: any) => {
    if (selectedPO) {
      onEditPO({ ...selectedPO, ...poData });
      setSelectedPO(null);
    }
  };

  return (
    <div className="space-y-6">
      <PurchaseOrderSummaryCards purchaseOrders={purchaseOrders} />

      <PurchaseOrderFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onNewPO={() => setShowNewPOForm(true)}
      />

      <PurchaseOrderList
        purchaseOrders={filteredPOs}
        vendors={vendors}
        onEditPO={openEditPO}
        onStatusChange={handleStatusChange}
      />

      <NewPurchaseOrderForm
        open={showNewPOForm}
        onOpenChange={setShowNewPOForm}
        vendors={vendors}
        onSubmit={onAddPO}
      />

      <EditPurchaseOrderForm
        open={showEditPOForm}
        onOpenChange={setShowEditPOForm}
        purchaseOrder={selectedPO}
        vendors={vendors}
        onSubmit={handleEditPO}
      />
    </div>
  );
};

export default PurchaseOrderManagement;
