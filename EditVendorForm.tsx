import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { Vendor } from '../../types';
import { useUpdateVendor } from "@/hooks/useSupabaseMutations";
import { useToast } from "@/hooks/use-toast";
import { useFormValidation } from "@/components/ui/enhanced-form-validation";

interface EditVendorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: Vendor | null;
  onSubmit: (vendorData: any) => void;
}

const EditVendorForm: React.FC<EditVendorFormProps> = ({ open, onOpenChange, vendor, onSubmit }) => {
  const [formData, setFormData] = useState({
    // Legacy fields (keeping for backward compatibility)
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    services: [] as string[],

    status: 'active',
    contractEndDate: '',

    // New comprehensive fields
    legal_name: '',
    dba_name: '',
    address: '',
    website: '',

    // Primary contacts
    main_contact_name: '',
    main_contact_title: '',
    main_contact_email: '',
    main_contact_phone: '',
    billing_contact_name: '',
    billing_contact_title: '',
    billing_contact_email: '',
    billing_contact_phone: '',

    // Financial & Legal
    tax_id: '',
    bankName: '',
    bankAccount: '',
    routing_number: '',
    payment_terms: 'net30',

    // Internal info
    category: '',
    notes: '',
  });

  const [newService, setNewService] = useState('');
  const updateVendor = useUpdateVendor();
  const { toast } = useToast();

  const requiredFields = [
    "name",
    "legal_name", 
    "address",
    "phone",
    "email",
    "main_contact_name",
    "main_contact_email",
    "billing_contact_name", 
    "billing_contact_email",
    "tax_id",
    "bankName",
    "bankAccount",
    "routing_number"
  ];

  const isFormValid = useFormValidation(formData, requiredFields);

  // Populate form data when vendor changes
  useEffect(() => {
    if (vendor) {
      setFormData({
        // Legacy fields
        name: vendor.name ?? '',
        contactPerson: vendor.contactPerson ?? '',
        email: vendor.email ?? '',
        phone: vendor.phone ?? '',
        services: vendor.services ?? [],
        status: vendor.status ?? 'active',
        contractEndDate: vendor.contractEndDate ?? '',

        // New comprehensive fields
        legal_name: vendor.legal_name ?? '',
        dba_name: vendor.dba_name ?? '',
        address: vendor.address ?? '',
        website: vendor.website ?? '',

        // Primary contacts
        main_contact_name: vendor.main_contact_name ?? '',
        main_contact_title: vendor.main_contact_title ?? '',
        main_contact_email: vendor.main_contact_email ?? '',
        main_contact_phone: vendor.main_contact_phone ?? '',
        billing_contact_name: vendor.billing_contact_name ?? '',
        billing_contact_title: vendor.billing_contact_title ?? '',
        billing_contact_email: vendor.billing_contact_email ?? '',
        billing_contact_phone: vendor.billing_contact_phone ?? '',

        // Financial & Legal
        tax_id: vendor.tax_id ?? '',
        bankName: vendor.bankName ?? '',
        bankAccount: vendor.bankAccount ?? '',
        routing_number: vendor.routing_number ?? '',
        payment_terms: vendor.payment_terms ?? 'net30',

        // Internal info
        category: vendor.category ?? '',
        notes: vendor.notes ?? '',
      });
    }
  }, [vendor]);

  // Early return: only show form if a vendor is selected
  if (!vendor) return null;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    if (!isFormValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateVendor.mutateAsync({
        id: vendor.id,
        // Legacy fields
        name: formData.name,
        contact_person: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        services: formData.services,
        status: formData.status,
        contract_end_date: formData.contractEndDate || null,

        // New comprehensive fields
        legal_name: formData.legal_name,
        dba_name: formData.dba_name,
        address: formData.address,
        website: formData.website,

        // Primary contacts
        main_contact_name: formData.main_contact_name,
        main_contact_title: formData.main_contact_title,
        main_contact_email: formData.main_contact_email,
        main_contact_phone: formData.main_contact_phone,
        billing_contact_name: formData.billing_contact_name,
        billing_contact_title: formData.billing_contact_title,
        billing_contact_email: formData.billing_contact_email,
        billing_contact_phone: formData.billing_contact_phone,

        // Financial & Legal
        tax_id: formData.tax_id,
        bankName: formData.bankName,
        bankAccount: formData.bankAccount,
        routing_number: formData.routing_number,
        payment_terms: formData.payment_terms,

        // Internal info
        category: formData.category,
        notes: formData.notes,
      });

      toast({
        title: "Vendor Updated",
        description: `${formData.name} has been updated successfully.`,
      });

      onSubmit(formData);
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Error updating vendor",
        description: err?.message ?? "Failed to update vendor",
        variant: "destructive",
      });
    }
  };

  const addService = () => {
    const trimmed = newService.trim();
    if (trimmed && !formData.services.includes(trimmed)) {
      setFormData({
        ...formData,
        services: [...formData.services, trimmed]
      });
      setNewService('');
    }
  };

  const removeService = (service: string) => {
    setFormData({
      ...formData,
      services: formData.services.filter(s => s !== service)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] bg-white flex flex-col">
        <DialogHeader className="bg-[#002B5C] rounded-t-lg p-4 sticky top-0 z-10 mt-2">
          <DialogTitle className="text-orange-500">Edit Vendor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto px-1 pr-2">
          {/* Company Details */}
          <div>
            <h3 className="font-semibold">Company Details</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor="name">Vendor Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="legal_name">Legal Name *</Label>
                <Input
                  id="legal_name"
                  value={formData.legal_name}
                  onChange={(e) => handleInputChange("legal_name", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dba_name">DBA Name</Label>
                <Input
                  id="dba_name"
                  value={formData.dba_name}
                  onChange={(e) => handleInputChange("dba_name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="address">Business Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Main Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Main Email *</Label>
                <Input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Primary Contacts */}
          <div>
            <h3 className="font-semibold">Primary Contacts</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label>Main Contact Name *</Label>
                <Input
                  value={formData.main_contact_name}
                  onChange={(e) => handleInputChange("main_contact_name", e.target.value)}
                />
              </div>
              <div>
                <Label>Main Contact Title</Label>
                <Input
                  value={formData.main_contact_title}
                  onChange={(e) => handleInputChange("main_contact_title", e.target.value)}
                />
              </div>
              <div>
                <Label>Main Contact Email *</Label>
                <Input
                  type="email"
                  value={formData.main_contact_email}
                  onChange={(e) => handleInputChange("main_contact_email", e.target.value)}
                />
              </div>
              <div>
                <Label>Main Contact Phone</Label>
                <Input
                  value={formData.main_contact_phone}
                  onChange={(e) => handleInputChange("main_contact_phone", e.target.value)}
                />
              </div>
              <div>
                <Label>Billing Contact Name *</Label>
                <Input
                  value={formData.billing_contact_name}
                  onChange={(e) => handleInputChange("billing_contact_name", e.target.value)}
                />
              </div>
              <div>
                <Label>Billing Contact Title</Label>
                <Input
                  value={formData.billing_contact_title}
                  onChange={(e) => handleInputChange("billing_contact_title", e.target.value)}
                />
              </div>
              <div>
                <Label>Billing Contact Email *</Label>
                <Input
                  type="email"
                  value={formData.billing_contact_email}
                  onChange={(e) => handleInputChange("billing_contact_email", e.target.value)}
                />
              </div>
              <div>
                <Label>Billing Contact Phone</Label>
                <Input
                  value={formData.billing_contact_phone}
                  onChange={(e) => handleInputChange("billing_contact_phone", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Financial & Legal */}
          <div>
            <h3 className="font-semibold">Financial & Legal</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label>Tax ID (EIN) *</Label>
                <Input
                  value={formData.tax_id}
                  onChange={(e) => handleInputChange("tax_id", e.target.value)}
                />
              </div>
              <div>
                <Label>Bank Name *</Label>
                <Input
                  value={formData.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                />
              </div>
              <div>
                <Label>Bank Account # *</Label>
                <Input
                  value={formData.bankAccount}
                  onChange={(e) => handleInputChange("bankAccount", e.target.value)}
                />
              </div>
              <div>
                <Label>Routing Number *</Label>
                <Input
                  value={formData.routing_number}
                  onChange={(e) => handleInputChange("routing_number", e.target.value)}
                />
              </div>
              <div>
                <Label>Payment Terms</Label>
                <Select
                  value={formData.payment_terms}
                  onValueChange={(val) => handleInputChange("payment_terms", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="net15">Net 15</SelectItem>
                    <SelectItem value="net30">Net 30</SelectItem>
                    <SelectItem value="net45">Net 45</SelectItem>
                    <SelectItem value="net60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Legacy Fields Section */}
          <div>
            <h3 className="font-semibold">Additional Details</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label>Contact Person (Legacy)</Label>
                <Input
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                />
              </div>
              <div>
                <Label>Contract End Date</Label>
                <Input
                  type="date"
                  value={formData.contractEndDate}
                  onChange={(e) => handleInputChange("contractEndDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => handleInputChange("status", val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preferred">Preferred</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category/Tags</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  placeholder="e.g. Marketing, Cloud"
                />
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold">Services</h3>
            <div className="flex space-x-2 mt-2">
              <Input
                placeholder="Add a service"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
              />
              <Button type="button" onClick={addService}>Add</Button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {formData.services.map((service) => (
                <Badge key={service} variant="secondary" className="flex items-center gap-1">
                  {service}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeService(service)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 pb-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid || updateVendor.isPending}
            >
              {updateVendor.isPending ? "Updating..." : "Update Vendor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditVendorForm;