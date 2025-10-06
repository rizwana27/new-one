
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useProjects } from '@/hooks/useSupabaseData';

interface AssignToProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: any;
  onSubmit: (data: any) => void;
}

const AssignToProjectModal: React.FC<AssignToProjectModalProps> = ({
  open,
  onOpenChange,
  resource,
  onSubmit
}) => {
  const { register, handleSubmit, setValue, reset } = useForm();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  const onFormSubmit = (data: any) => {
    const assignmentData = {
      resourceId: resource.id,
      resourceName: resource.name,
      projectId: data.projectId,
      allocationPercentage: parseInt(data.allocationPercentage),
      startDate: data.startDate,
      endDate: data.endDate,
      role: data.role || resource.role,
      notes: data.notes
    };
    
    onSubmit(assignmentData);
    reset();
    onOpenChange(false);
  };

  if (!resource) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Assign {resource.name} to Project</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="projectId">Project</Label>
            <Select onValueChange={(value) => setValue('projectId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projectsLoading ? (
                  <div className="p-2 text-center text-muted-foreground">Loading projects...</div>
                ) : projects.length === 0 ? (
                  <div className="p-2 text-center text-muted-foreground">No projects available</div>
                ) : (
                  projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input 
                id="startDate" 
                type="date"
                {...register('startDate', { required: true })}
              />
            </div>
            
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input 
                id="endDate" 
                type="date"
                {...register('endDate', { required: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="allocationPercentage">Allocation %</Label>
              <Input 
                id="allocationPercentage" 
                type="number"
                min="1"
                max="100"
                {...register('allocationPercentage', { required: true })}
                placeholder="50"
              />
            </div>
            
            <div>
              <Label htmlFor="role">Role in Project</Label>
              <Input 
                id="role" 
                {...register('role')}
                placeholder={resource.role}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea 
              id="notes" 
              {...register('notes')}
              placeholder="Any additional notes about this assignment..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={projectsLoading}>
              Assign to Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignToProjectModal;
