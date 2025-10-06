import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Filter, Building2, FileText, Users } from 'lucide-react';
import VendorsOverview from './VendorsOverview';
import PurchaseOrderManagement from './PurchaseOrderManagement';
import DetailedContractManagement from './DetailedContractManagement';
import NewVendorForm from './NewVendorForm';
import EditVendorForm from './EditVendorForm';
import { useVendors, usePurchaseOrders } from '../../hooks/useSupabaseData';
import { useAddPurchaseOrder } from '../../hooks/useSupabaseMutations';
import { colorClasses } from '@/styles/colors';

const VendorsModule: React.FC = () => {
  const [selectedView, setSelectedView] = useState('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewVendorForm, setShowNewVendorForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  
  const { data: vendors = [], refetch: refetchVendors } = useVendors();
  const { data: purchaseOrdersData = [], refetch: refetchPOs } = usePurchaseOrders();

  const [localPurchaseOrders, setLocalPurchaseOrders] = useState(purchaseOrdersData);

  useEffect(() => {
    setLocalPurchaseOrders(purchaseOrdersData);
  }, [purchaseOrdersData]);

  const addPO = useAddPurchaseOrder();

  // Transform purchase orders for UI
  const purchaseOrders = localPurchaseOrders.map(po => ({
    ...po,
    status: (['pending', 'draft', 'approved', 'rejected', 'delivered', 'cancelled', 'completed'].includes(po.status) 
      ? po.status 
      : 'pending') as "pending" | "draft" | "approved" | "rejected" | "delivered" | "cancelled" | "completed"
  }));

  // Handlers
  const handleNewVendor = () => {
    setShowNewVendorForm(false);
    refetchVendors();
  };

  const handleEditVendor = (vendor: any) => {
    setEditingVendor(vendor);
  };

  const handleVendorUpdate = () => {
    setEditingVendor(null);
    refetchVendors();
  };

  const handleAddPO = async (poData: any) => {
    try {
      const createdPO = await addPO.mutateAsync(poData);
      setLocalPurchaseOrders(prev => [...prev, createdPO]);
      //console.log('PO added:', createdPO);
    } catch (err: any) {
      console.error('Error adding PO:', err.message);
    }
  };

  const handleEditPO = (poId: string) => {
    //console.log('Edit purchase order:', poId);
    // Implement your edit PO form if needed
  };

  const handleUpdatePOStatus = (poId: string, status: string) => {
    //console.log('Update PO status:', poId, status);
    // Implement status update
  };

  return (
    <div className="space-y-6">
      {/* Header (standardized) */}
      <div className="bg-[#002B5C] p-4 rounded-b-lg relative mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-[#f8258c]">Vendor Management</h1>
            <p className="text-white/80 mt-1">Manage vendor relationships, contracts, and procurement</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="hover:bg-orange-50 border-[#f8258c] text-[#f8258c]"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button 
              onClick={() => setShowNewVendorForm(true)}
              className={colorClasses.buttonSecondary}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <Building2 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="purchase-orders">
            <FileText className="h-4 w-4 mr-2" />
            Purchase Orders
          </TabsTrigger>
          <TabsTrigger value="contracts">
            <Users className="h-4 w-4 mr-2" />
            Contracts
          </TabsTrigger>
        </TabsList>

        {/* Vendors Overview */}
        <TabsContent value="overview" className="space-y-6">
          <VendorsOverview 
            vendors={vendors} 
            onVendorsUpdate={() => refetchVendors()}
          />
        </TabsContent>

        {/* Purchase Orders */}
        <TabsContent value="purchase-orders" className="space-y-6">
          <PurchaseOrderManagement 
            vendors={vendors}
            purchaseOrders={purchaseOrders}
            onAddPO={handleAddPO}
            onEditPO={handleEditPO}
            onUpdatePOStatus={handleUpdatePOStatus}
          />
        </TabsContent>

        {/* Contracts */}
        <TabsContent value="contracts" className="space-y-6">
          <DetailedContractManagement />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showNewVendorForm && (
        <NewVendorForm
          open={showNewVendorForm}
          onOpenChange={setShowNewVendorForm}
          onSubmit={handleNewVendor}
        />
      )}

      {editingVendor && (
        <EditVendorForm
          open={!!editingVendor}
          vendor={editingVendor}
          onOpenChange={() => setEditingVendor(null)}
          onSubmit={handleVendorUpdate}
        />
      )}
    </div>
  );
};

export default VendorsModule;
