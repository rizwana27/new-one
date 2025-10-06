
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";

interface EditSubcontractorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: any;
  vendors: any[];
  onSubmit: (data: any) => void;
}

const EditSubcontractorForm: React.FC<EditSubcontractorFormProps> = ({
  open,
  onOpenChange,
  resource,
  vendors,
  onSubmit
}) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [skills, setSkills] = React.useState<string[]>(resource?.skills || []);
  const [newSkill, setNewSkill] = React.useState('');

  React.useEffect(() => {
    if (resource) {
      setValue('name', resource.name);
      setValue('email', resource.email);
      setValue('role', resource.role);
      setValue('vendorId', resource.vendorId);
      setValue('hourlyRate', resource.hourlyRate);
      setValue('capacity', resource.capacity);
      setSkills(resource.skills || []);
    }
  }, [resource, setValue]);

  const onFormSubmit = (data: any) => {
    const formData = {
      ...resource,
      ...data,
      skills,
      hourlyRate: parseFloat(data.hourlyRate),
      capacity: parseInt(data.capacity),
    };
    
    onSubmit(formData);
    onOpenChange(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  if (!resource) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit Subcontractor</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                {...register('name', { required: true })}
                placeholder="Enter full name"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email"
                {...register('email', { required: true })}
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Input 
                id="role" 
                {...register('role', { required: true })}
                placeholder="e.g., Senior Developer"
              />
            </div>
            
            <div>
              <Label htmlFor="vendorId">Vendor</Label>
              <Select value={watch('vendorId')} onValueChange={(value) => setValue('vendorId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map(vendor => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <Input 
                id="hourlyRate" 
                type="number"
                {...register('hourlyRate', { required: true })}
                placeholder="150"
              />
            </div>
            
            <div>
              <Label htmlFor="capacity">Weekly Capacity (hours)</Label>
              <Input 
                id="capacity" 
                type="number"
                {...register('capacity', { required: true })}
                placeholder="40"
              />
            </div>
          </div>

          <div>
            <Label>Skills</Label>
            <div className="flex gap-2 mb-2">
              <Input 
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Subcontractor</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubcontractorForm;
