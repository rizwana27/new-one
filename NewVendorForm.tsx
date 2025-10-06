import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAddVendor } from "@/hooks/mutations/useVendorMutations";
import { useToast } from "@/hooks/use-toast";
import { useFormValidation } from "@/components/ui/enhanced-form-validation";

interface NewVendorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (vendorData: any) => void;
}

const NewVendorForm: React.FC<NewVendorFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    legal_name: "",
    dba_name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    main_contact_name: "",
    main_contact_title: "",
    main_contact_email: "",
    main_contact_phone: "",
    billing_contact_name: "",
    billing_contact_title: "",
    billing_contact_email: "",
    billing_contact_phone: "",
    tax_id: "",
    bankName: "",
    bankAccount: "",
    routing_number: "",
    payment_terms: "net30",
    status: "active" as const,
    category: "",
    notes: "",
  });

  const [sameAsMain, setSameAsMain] = useState(false);

  const { toast } = useToast();
  const addVendor = useAddVendor();

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
    "routing_number",
  ];

  const isFormValid = useFormValidation(formData, requiredFields);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // If sameAsMain is enabled, auto-sync billing fields from main fields
      if (sameAsMain) {
        updated.billing_contact_name = updated.main_contact_name;
        updated.billing_contact_title = updated.main_contact_title;
        updated.billing_contact_email = updated.main_contact_email;
        updated.billing_contact_phone = updated.main_contact_phone;
      }

      return updated;
    });
  };

  const handleSameAsMainToggle = (checked: boolean) => {
    setSameAsMain(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        billing_contact_name: prev.main_contact_name,
        billing_contact_title: prev.main_contact_title,
        billing_contact_email: prev.main_contact_email,
        billing_contact_phone: prev.main_contact_phone,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addVendor.mutateAsync(formData);
      toast({ title: "Vendor Created", description: "New vendor successfully created." });

      if (onSubmit) onSubmit(formData);
      onOpenChange(false);
    } catch (err) {
      console.error("Error creating vendor:", err);
      toast({ title: "Error", description: "Failed to create vendor.", variant: "destructive" });
    }
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="bg-gray-100 border border-gray-200 px-3 py-2 rounded-md mt-6">
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] bg-white flex flex-col">
        <DialogHeader className="bg-[#002B5C] rounded-t-lg p-4 sticky top-0 z-10 mt-2">
          <DialogTitle className="text-orange-500">Add New Vendor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto px-1 pr-2">

          {/* Company Details */}
          <SectionHeader title="Company Details" />
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Label>Vendor Name *</Label>
              <Input value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
            </div>
            <div>
              <Label>Legal Name *</Label>
              <Input value={formData.legal_name} onChange={(e) => handleInputChange("legal_name", e.target.value)} />
            </div>
            <div>
              <Label>DBA Name</Label>
              <Input value={formData.dba_name} onChange={(e) => handleInputChange("dba_name", e.target.value)} />
            </div>
            <div>
              <Label>Business Address *</Label>
              <Textarea value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={formData.website} onChange={(e) => handleInputChange("website", e.target.value)} />
            </div>
            <div>
              <Label>Main Phone *</Label>
              <Input value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} />
            </div>
            <div>
              <Label>Main Email *</Label>
              <Input type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} />
            </div>
          </div>

          {/* Primary Contacts */}
          <SectionHeader title="Primary Contacts" />
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Label>Main Contact Name *</Label>
              <Input value={formData.main_contact_name} onChange={(e) => handleInputChange("main_contact_name", e.target.value)} />
            </div>
            <div>
              <Label>Main Contact Title</Label>
              <Input value={formData.main_contact_title} onChange={(e) => handleInputChange("main_contact_title", e.target.value)} />
            </div>
            <div>
              <Label>Main Contact Email *</Label>
              <Input type="email" value={formData.main_contact_email} onChange={(e) => handleInputChange("main_contact_email", e.target.value)} />
            </div>
            <div>
              <Label>Main Contact Phone</Label>
              <Input value={formData.main_contact_phone} onChange={(e) => handleInputChange("main_contact_phone", e.target.value)} />
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <Checkbox checked={sameAsMain} onCheckedChange={(c) => handleSameAsMainToggle(!!c)} />
            <Label>Billing contact is same as main contact</Label>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Label>Billing Contact Name *</Label>
              <Input value={formData.billing_contact_name} onChange={(e) => handleInputChange("billing_contact_name", e.target.value)} disabled={sameAsMain}/>
            </div>
            <div>
              <Label>Billing Contact Title</Label>
              <Input value={formData.billing_contact_title} onChange={(e) => handleInputChange("billing_contact_title", e.target.value)} disabled={sameAsMain}/>
            </div>
            <div>
              <Label>Billing Contact Email *</Label>
              <Input type="email" value={formData.billing_contact_email} onChange={(e) => handleInputChange("billing_contact_email", e.target.value)} disabled={sameAsMain}/>
            </div>
            <div>
              <Label>Billing Contact Phone</Label>
              <Input value={formData.billing_contact_phone} onChange={(e) => handleInputChange("billing_contact_phone", e.target.value)} disabled={sameAsMain}/>
            </div>
          </div>

          {/* Financial & Legal */}
          <SectionHeader title="Financial & Legal" />
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Label>Tax ID (EIN) *</Label>
              <Input value={formData.tax_id} onChange={(e) => handleInputChange("tax_id", e.target.value)} />
            </div>
            <div>
              <Label>Bank Name *</Label>
              <Input value={formData.bankName} onChange={(e) => handleInputChange("bankName", e.target.value)} />
            </div>
            <div>
              <Label>Bank Account # *</Label>
              <Input value={formData.bankAccount} onChange={(e) => handleInputChange("bankAccount", e.target.value)} />
            </div>
            <div>
              <Label>Routing Number *</Label>
              <Input value={formData.routing_number} onChange={(e) => handleInputChange("routing_number", e.target.value)} />
            </div>
            <div>
              <Label>Payment Terms</Label>
              <Select value={formData.payment_terms} onValueChange={(val) => handleInputChange("payment_terms", val)}>
                <SelectTrigger><SelectValue placeholder="Select terms" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="net15">Net 15</SelectItem>
                  <SelectItem value="net30">Net 30</SelectItem>
                  <SelectItem value="net45">Net 45</SelectItem>
                  <SelectItem value="net60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Internal Info */}
          <SectionHeader title="Internal Information" />
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(val) => handleInputChange("status", val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="preferred">Preferred</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category/Tags</Label>
              <Input value={formData.category} onChange={(e) => handleInputChange("category", e.target.value)} placeholder="e.g. Marketing, Cloud"/>
            </div>
          </div>
          <div className="mt-2">
            <Label>Notes</Label>
            <Textarea value={formData.notes} onChange={(e) => handleInputChange("notes", e.target.value)} />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 pb-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!isFormValid || addVendor.isPending}>
              {addVendor.isPending ? "Adding..." : "Add Vendor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewVendorForm;
