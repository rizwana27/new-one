"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EnhancedCalendar } from "@/components/ui/enhanced-calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isAfter, startOfDay, isBefore } from "date-fns";
import { Calendar as CalendarIcon, Plus, Edit, AlertTriangle, FileText, Clock, CheckCircle2, Bell } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useVendors } from "../../hooks/useSupabaseData";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client - ensure these env vars are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing! Check your .env.local file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface AuditLogEntry {
  action: string;
  user: string;
  timestamp: string;
  meta?: Record<string, any>;
}
type ContractStatus = 'Draft' | 'Under Review' | 'Signed' | 'Active' | 'Expired' | 'Terminated';
type ContractType = 'MSA' | 'SOW';

interface Contract {
  id: string;
  vendorName: string;
  title: string;
  type: ContractType;
  value: number;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  scope: string;
  milestones: string;
  paymentTerms: string;
  companySigner: string;
  vendorSigner: string;
  vendorSigned: boolean;
  companySigned: boolean;
  pdfFileName?: string;
  pdfUrl?: string;
  auditLog: AuditLogEntry[];
  createdAt: string;
  updatedAt: string;
}

type ContractFormData = Omit<Contract, 'id' | 'pdfUrl' | 'pdfFileName' | 'auditLog' | 'createdAt' | 'updatedAt'> & {
  pdfFile?: File | null;
};

// Supabase database functions with detailed error logging
async function dbFetchContracts(): Promise<Contract[]> {
  console.log('Fetching contracts from Supabase...');
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching contracts:', error);
    throw error;
  }
  
  console.log('Fetched contracts:', data?.length || 0);
  return (data || []).map(row => ({
    id: row.id,
    vendorName: row.vendor_name,
    title: row.title,
    type: row.type,
    value: Number(row.value),
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    scope: row.scope || '',
    milestones: row.milestones || '',
    paymentTerms: row.payment_terms || '',
    companySigner: row.company_signer || '',
    vendorSigner: row.vendor_signer || '',
    vendorSigned: row.vendor_signed || false,
    companySigned: row.company_signed || false,
    pdfFileName: row.pdf_file_name,
    pdfUrl: row.pdf_url,
    auditLog: row.audit_log || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

async function dbCreateContract(c: Contract): Promise<void> {
  console.log('Creating contract in Supabase:', c.id);
  
  const payload = {
    id: c.id,
    vendor_name: c.vendorName,
    title: c.title,
    type: c.type,
    value: c.value,
    start_date: c.startDate,
    end_date: c.endDate,
    status: c.status,
    scope: c.scope,
    milestones: c.milestones,
    payment_terms: c.paymentTerms,
    company_signer: c.companySigner,
    vendor_signer: c.vendorSigner,
    vendor_signed: c.vendorSigned,
    company_signed: c.companySigned,
    pdf_file_name: c.pdfFileName || null,
    pdf_url: c.pdfUrl || null,
    audit_log: c.auditLog,
    created_at: c.createdAt,
    updated_at: c.updatedAt
  };

  console.log('Insert payload:', payload);
  
  const { data, error } = await supabase
    .from('contracts')
    .insert(payload)
    .select();
  
  if (error) {
    console.error('Error creating contract:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to create contract: ${error.message}`);
  }
  
  console.log('Contract created successfully:', data);
}

async function dbUpdateContract(c: Contract): Promise<void> {
  console.log('Updating contract in Supabase:', c.id);
  
  const payload = {
    vendor_name: c.vendorName,
    title: c.title,
    type: c.type,
    value: c.value,
    start_date: c.startDate,
    end_date: c.endDate,
    status: c.status,
    scope: c.scope,
    milestones: c.milestones,
    payment_terms: c.paymentTerms,
    company_signer: c.companySigner,
    vendor_signer: c.vendorSigner,
    vendor_signed: c.vendorSigned,
    company_signed: c.companySigned,
    pdf_file_name: c.pdfFileName || null,
    pdf_url: c.pdfUrl || null,
    audit_log: c.auditLog,
    updated_at: c.updatedAt
  };

  console.log('Update payload:', payload);
  
  const { data, error } = await supabase
    .from('contracts')
    .update(payload)
    .eq('id', c.id)
    .select();
  
  if (error) {
    console.error('Error updating contract:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to update contract: ${error.message}`);
  }
  
  console.log('Contract updated successfully:', data);
}

async function uploadFile(file: File): Promise<{ fileName: string; url: string }> {
  console.log('Uploading file:', file.name);
  
  const fileName = `${Date.now()}-${file.name}`;
  
  try {
    const { data, error } = await supabase.storage
      .from('contracts')
      .upload(fileName, file);
    
    if (error) {
      console.error('Storage upload error:', error);
      // If storage fails, fall back to object URL for now
      console.warn('Storage upload failed, using fallback URL');
      return { fileName: file.name, url: URL.createObjectURL(file) };
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(fileName);
    
    console.log('File uploaded successfully:', publicUrl);
    return { fileName: file.name, url: publicUrl };
  } catch (err) {
    console.error('Upload exception:', err);
    // Fallback to object URL
    return { fileName: file.name, url: URL.createObjectURL(file) };
  }
}

async function notifyClient(_contract: Contract) {
  return;
}

const getStatusBadgeVariant = (status: ContractStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Active':
    case 'Signed':
      return 'default';
    case 'Expired':
    case 'Terminated':
      return 'destructive';
    case 'Under Review':
      return 'secondary';
    case 'Draft':
    default:
      return 'outline';
  }
};

const getTypeColor = (type: ContractType) => {
  switch (type) {
    case 'MSA': return 'bg-blue-100 text-blue-800';
    case 'SOW': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const startOf = (d: Date) => startOfDay(d);
const daysUntil = (iso: string) => {
  const today = startOf(new Date());
  const d = startOf(new Date(iso));
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};
const nowISO = () => new Date().toISOString();

function deriveStatusAfterSignatures(current: Contract): ContractStatus {
  if (current.vendorSigned && current.companySigned) {
    const start = new Date(current.startDate);
    const today = new Date();
    return (isBefore(start, startOf(today)) || startOf(start).getTime() === startOf(today).getTime())
      ? 'Active'
      : 'Signed';
  }
  return current.status;
}

const DetailedContractManagement: React.FC = () => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: supabaseVendors = [] } = useVendors();
  const vendorNames = useMemo(
    () => (supabaseVendors as any[]).map(v => v.name).filter(Boolean).sort(),
    [supabaseVendors]
  );
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const mountedRef = useRef(false);

  const loadContracts = async () => {
    try {
      setLoading(true);
      console.log('Loading contracts...');
      const cList = await dbFetchContracts();
      setContracts(cList);
      console.log('Contracts loaded:', cList.length);
    } catch (e: any) {
      console.error('Load contracts error:', e);
      toast({ 
        title: 'Failed to load contracts', 
        description: e?.message || String(e), 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    
    console.log('Component mounted, loading contracts...');
    loadContracts();

    // Set up realtime subscription
    const subscription = supabase
      .channel('contracts_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'contracts' 
      }, (payload) => {
        console.log('Realtime change detected:', payload);
        loadContracts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const expiringContracts = useMemo(
    () => contracts.filter(c => {
      const d = daysUntil(c.endDate);
      return d <= 30 && d > 0 && c.status === 'Active';
    }),
    [contracts]
  );

  const handleSaveContract = async (contractData: ContractFormData) => {
    const now = nowISO();
    console.log('Saving contract...', { isEditing, selectedContract: selectedContract?.id });
    
    try {
      let pdfDetails: { pdfFileName?: string; pdfUrl?: string } = {};
      if (contractData.pdfFile) {
        console.log('Uploading PDF file...');
        const uploaded = await uploadFile(contractData.pdfFile);
        pdfDetails = { pdfFileName: uploaded.fileName, pdfUrl: uploaded.url };
      }

      if (selectedContract && isEditing) {
        // Update existing contract
        console.log('Updating existing contract:', selectedContract.id);
        const original = contracts.find(c => c.id === selectedContract.id);
        if (!original) throw new Error('Contract not found');

        const updated: Contract = {
          ...original,
          ...contractData,
          ...(!contractData.pdfFile ? { 
            pdfFileName: original.pdfFileName, 
            pdfUrl: original.pdfUrl 
          } : pdfDetails),
          updatedAt: now,
          auditLog: [
            ...original.auditLog, 
            { action: 'Contract Updated', user: 'Current User', timestamp: now }
          ]
        };
        updated.status = deriveStatusAfterSignatures(updated);
        
        await dbUpdateContract(updated);
        await loadContracts();
        
        toast({ title: "Contract Updated Successfully" });
      } else {
        // Create new contract
        console.log('Creating new contract...');
        const newContract: Contract = {
          id: `contract-${Date.now()}`,
          vendorName: contractData.vendorName,
          title: contractData.title,
          type: contractData.type,
          value: contractData.value,
          startDate: contractData.startDate,
          endDate: contractData.endDate,
          status: contractData.status || 'Draft',
          scope: contractData.scope,
          milestones: contractData.milestones,
          paymentTerms: contractData.paymentTerms,
          companySigner: contractData.companySigner,
          vendorSigner: contractData.vendorSigner,
          vendorSigned: !!contractData.vendorSigned,
          companySigned: !!contractData.companySigned,
          ...pdfDetails,
          createdAt: now,
          updatedAt: now,
          auditLog: [{ 
            action: 'Contract Created', 
            user: 'Current User', 
            timestamp: now 
          }],
        };
        newContract.status = deriveStatusAfterSignatures(newContract);
        
        console.log('New contract data:', newContract);
        await dbCreateContract(newContract);
        await loadContracts();
        await notifyClient(newContract);
        
        toast({ 
          title: "Contract Created Successfully", 
          description: "Client was notified to review the contract." 
        });
      }

      setSelectedContract(null);
      setIsEditing(false);
      setShowNewForm(false);
    } catch (e: any) {
      console.error('Save contract error:', e);
      toast({ 
        title: "Failed to Save Contract", 
        description: e?.message || String(e), 
        variant: 'destructive' 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading contracts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug info - remove in production */}
      <div className="text-xs text-muted-foreground">
        Supabase connected: {supabaseUrl ? '✓' : '✗'} | Contracts loaded: {contracts.length}
      </div>

      {expiringContracts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Contracts Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringContracts.map(c => (
                <div key={c.id} className="flex justify-between items-center p-2 bg-white rounded border">
                  <p>
                    <span className="font-medium">{c.title}</span>
                    <span className="text-sm text-muted-foreground ml-2">({c.vendorName})</span>
                  </p>
                  <Badge variant="outline">{daysUntil(c.endDate)} days left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Contract Management</h2>
          <p className="text-muted-foreground">Track MSAs, SOWs, and other vendor agreements.</p>
        </div>
        <Button onClick={() => { 
          console.log('New contract button clicked');
          setShowNewForm(true); 
          setSelectedContract(null); 
          setIsEditing(true); 
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Contract
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold">Contracts ({contracts.length})</h3>
          {contracts.length > 0 ? (
            contracts.map(c => (
              <Card
                key={c.id}
                className={`cursor-pointer transition-colors ${selectedContract?.id === c.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => { 
                  setSelectedContract(c); 
                  setIsEditing(false); 
                  setShowNewForm(false); 
                }}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{c.title}</h4>
                    <Badge variant={getStatusBadgeVariant(c.status)}>{c.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.vendorName}</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded ${getTypeColor(c.type)}`}>{c.type}</span>
                    <span className="text-sm font-medium">${c.value.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Expires: {format(new Date(c.endDate), "PPP")}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
              <p>No contracts yet.</p>
              <p className="text-xs mt-2">Click "New Contract" to get started</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {(selectedContract || showNewForm) ? (
            <ContractForm
              vendors={vendorNames}
              contract={showNewForm ? null : selectedContract}
              isEditing={isEditing || showNewForm}
              onSave={handleSaveContract}
              onCancel={() => {
                setIsEditing(false);
                setShowNewForm(false);
                if (showNewForm) setSelectedContract(null);
              }}
              onEdit={() => setIsEditing(true)}
              onContractChange={async (updated) => {
                await loadContracts();
                if (selectedContract && updated.id === selectedContract.id) {
                  const refreshed = contracts.find(c => c.id === updated.id);
                  if (refreshed) setSelectedContract(refreshed);
                }
              }}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a contract to view details.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

interface ContractFormProps {
  vendors: string[];
  contract: Contract | null;
  isEditing: boolean;
  onSave: (data: ContractFormData) => void;
  onCancel: () => void;
  onEdit: () => void;
  onContractChange: (c: Contract) => void;
}

const ContractForm: React.FC<ContractFormProps> = ({
  vendors, contract, isEditing, onSave, onCancel, onEdit, onContractChange
}) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState<Omit<ContractFormData, 'pdfFile'>>({
    vendorName: '', title: '', type: 'SOW', value: 0,
    status: 'Draft', scope: '', milestones: '', paymentTerms: '',
    companySigner: '', vendorSigner: '', vendorSigned: false, companySigned: false,
    startDate: '', endDate: ''
  });
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [vendorSelect, setVendorSelect] = useState<string>('');

  useEffect(() => {
    if (contract) {
      setFormData({
        vendorName: contract.vendorName, title: contract.title, type: contract.type,
        value: contract.value, status: contract.status, scope: contract.scope,
        milestones: contract.milestones, paymentTerms: contract.paymentTerms,
        companySigner: contract.companySigner, vendorSigner: contract.vendorSigner,
        vendorSigned: contract.vendorSigned, companySigned: contract.companySigned,
        startDate: contract.startDate, endDate: contract.endDate
      });
      setStartDate(contract.startDate ? new Date(contract.startDate) : undefined);
      setEndDate(contract.endDate ? new Date(contract.endDate) : undefined);
      setVendorSelect(contract.vendorName || '');
    } else {
      setFormData({
        vendorName: '', title: '', type: 'SOW', value: 0, status: 'Draft',
        scope: '', milestones: '', paymentTerms: '', companySigner: '', vendorSigner: '',
        vendorSigned: false, companySigned: false, startDate: '', endDate: ''
      });
      setStartDate(undefined);
      setEndDate(undefined);
      setVendorSelect('');
    }
    setPdfFile(null);
  }, [contract, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendorName) {
      toast({ title: 'Please select a vendor', variant: 'destructive' });
      return;
    }

    if (!startDate || !endDate) {
      toast({ title: 'Please select start and end dates', variant: 'destructive' });
      return;
    }
    if (isAfter(startDate, endDate)) {
      toast({ title: 'Start date cannot be after end date', variant: 'destructive' });
      return;
    }

    console.log('Form submitted with data:', formData);

    onSave({
      ...formData,
      vendorName: formData.vendorName,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      pdfFile
    });
  };

  const markSigned = async (which: 'vendor' | 'company') => {
    if (!contract) return;
    const now = nowISO();
    const updated: Contract = {
      ...contract,
      vendorSigned: which === 'vendor' ? true : contract.vendorSigned,
      companySigned: which === 'company' ? true : contract.companySigned,
      updatedAt: now,
      auditLog: [
        ...contract.auditLog,
        { action: which === 'vendor' ? 'Vendor Signed' : 'Company Signed', user: 'Current User', timestamp: now }
      ]
    };
    updated.status = deriveStatusAfterSignatures(updated);
    await dbUpdateContract(updated);
    onContractChange(updated);
    toast({ title: which === 'vendor' ? 'Vendor signature captured' : 'Company signature captured' });
  };

  const changeStatus = async (next: ContractStatus) => {
    if (!contract) return;
    const now = nowISO();
    const updated: Contract = {
      ...contract,
      status: next,
      updatedAt: now,
      auditLog: [
        ...contract.auditLog,
        { action: `Status changed to ${next}`, user: 'Current User', timestamp: now }
      ]
    };
    await dbUpdateContract(updated);
    onContractChange(updated);
    toast({ title: `Status updated: ${next}` });
  };

  if (!isEditing && contract) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{contract.title}</CardTitle>
              <p className="text-muted-foreground">{contract.vendorName}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => changeStatus('Under Review')}>Move to Review</Button>
              <Button onClick={onEdit}><Edit className="h-4 w-4 mr-2" />Edit</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><Label>Contract Type</Label><p className="capitalize font-semibold">{contract.type}</p></div>
            <div><Label>Status</Label><p><Badge variant={getStatusBadgeVariant(contract.status)}>{contract.status}</Badge></p></div>
            <div><Label>Contract Value</Label><p className="font-semibold">${contract.value.toLocaleString()}</p></div>
            <div><Label>Duration</Label><p>{format(new Date(contract.startDate), "P")} - {format(new Date(contract.endDate), "P")}</p></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Company Representative</Label>
              <p>{contract.companySigner}</p>
              <div className="mt-2 flex items-center gap-2">
                <CheckCircle2 className={`h-4 w-4 ${contract.companySigned ? 'text-green-600' : 'text-muted-foreground'}`} />
                <span className="text-sm">{contract.companySigned ? 'Signed' : 'Pending'}</span>
                {!contract.companySigned && (
                  <Button size="sm" variant="outline" onClick={() => markSigned('company')}>Mark Company Signed</Button>
                )}
              </div>
            </div>
            <div>
              <Label>Vendor Representative</Label>
              <p>{contract.vendorSigner}</p>
              <div className="mt-2 flex items-center gap-2">
                <CheckCircle2 className={`h-4 w-4 ${contract.vendorSigned ? 'text-green-600' : 'text-muted-foreground'}`} />
                <span className="text-sm">{contract.vendorSigned ? 'Signed' : 'Pending'}</span>
                {!contract.vendorSigned && (
                  <Button size="sm" variant="outline" onClick={() => markSigned('vendor')}>Mark Vendor Signed</Button>
                )}
              </div>
            </div>
          </div>

          <div><Label>Scope of Work / Services</Label><p className="text-sm mt-1">{contract.scope}</p></div>
          <div><Label>Payment Terms & Milestones</Label><p className="text-sm mt-1 whitespace-pre-wrap">{contract.paymentTerms || contract.milestones}</p></div>

          {contract.pdfUrl && (
            <div>
              <Label>Signed Document</Label>
              <Button variant="outline" className="mt-1 w-full justify-start" onClick={() => window.open(contract.pdfUrl, '_blank')}>
                <FileText className="h-4 w-4 mr-2" />View {contract.pdfFileName}
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => notifyClient(contract).then(() => toast({ title: 'Client notified' }))}>
              <Bell className="h-4 w-4 mr-2" />Notify Client
            </Button>
            {contract.status === 'Signed' && <Button onClick={() => changeStatus('Active')}>Activate</Button>}
          </div>

          <div>
            <Label>Audit Trail</Label>
            <div className="border rounded-lg p-2 mt-1 max-h-48 overflow-y-auto">
              {contract.auditLog.slice().reverse().map((log, idx) => (
                <div key={`${log.timestamp}-${log.action}-${idx}`} className="text-xs text-muted-foreground flex items-center mb-1">
                  <Clock className="h-3 w-3 mr-2" />
                  <span>{format(new Date(log.timestamp), 'P p')}: {log.action} by {log.user}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>{contract ? 'Edit Contract' : 'Create New Contract'}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Contract Title / Reference *</Label>
              <Input 
                id="title" 
                value={formData.title} 
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} 
                required 
                placeholder="e.g., Q1 2025 Development Services"
              />
            </div>
            <div>
              <Label htmlFor="vendor">Vendor Name *</Label>
              <select
                id="vendor"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={vendorSelect}
                onChange={(e) => {
                  const v = e.target.value;
                  setVendorSelect(v);
                  setFormData(p => ({ ...p, vendorName: v }));
                }}
                required
              >
                <option value="" disabled>Select an existing vendor</option>
                {vendors.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="type">Contract Type *</Label>
              <select 
                id="type" 
                value={formData.type} 
                onChange={e => setFormData(p => ({ ...p, type: e.target.value as ContractType }))} 
                className="w-full px-3 py-2 border rounded-md bg-background"
                required
              >
                <option value="SOW">SOW (Statement of Work)</option>
                <option value="MSA">MSA (Master Service Agreement)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select 
                id="status" 
                value={formData.status} 
                onChange={e => setFormData(p => ({ ...p, status: e.target.value as ContractStatus }))} 
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option>Draft</option>
                <option>Under Review</option>
                <option>Signed</option>
                <option>Active</option>
                <option>Expired</option>
                <option>Terminated</option>
              </select>
            </div>
            <div>
              <Label htmlFor="value">Total Value ($) *</Label>
              <Input 
                id="value" 
                type="number" 
                value={formData.value} 
                onChange={e => setFormData(p => ({ ...p, value: Number(e.target.value) }))} 
                required 
                min={0} 
                step="0.01"
                placeholder="50000"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start font-normal", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <EnhancedCalendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start font-normal", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <EnhancedCalendar mode="single" selected={endDate} onSelect={setEndDate} disabled={d => startDate ? d < startDate : false} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div>
            <Label htmlFor="scope">Scope of Work / Services</Label>
            <Textarea 
              id="scope" 
              value={formData.scope} 
              onChange={e => setFormData(p => ({ ...p, scope: e.target.value }))} 
              rows={3}
              placeholder="Describe the work to be performed, deliverables, and expectations..."
            />
          </div>
          <div>
            <Label htmlFor="milestones">Key Milestones & Deliverables</Label>
            <Textarea 
              id="milestones" 
              value={formData.milestones} 
              onChange={e => setFormData(p => ({ ...p, milestones: e.target.value }))} 
              rows={3} 
              placeholder="- Milestone 1: Date&#10;- Milestone 2: Date" 
            />
          </div>
          <div>
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Textarea 
              id="paymentTerms" 
              value={formData.paymentTerms} 
              onChange={e => setFormData(p => ({ ...p, paymentTerms: e.target.value }))} 
              rows={3} 
              placeholder="e.g., 30% upfront, 40% on milestone, 30% on delivery" 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companySigner">Company Representative</Label>
              <Input 
                id="companySigner" 
                value={formData.companySigner} 
                onChange={e => setFormData(p => ({ ...p, companySigner: e.target.value }))} 
                placeholder="e.g., Jane Doe, CEO"
              />
              <div className="mt-2 flex items-center gap-2 text-sm">
                <input 
                  id="companySigned" 
                  type="checkbox" 
                  className="h-4 w-4" 
                  checked={formData.companySigned} 
                  onChange={(e) => setFormData(p => ({ ...p, companySigned: e.target.checked }))} 
                />
                <Label htmlFor="companySigned">Company Signed</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="vendorSigner">Vendor Representative</Label>
              <Input 
                id="vendorSigner" 
                value={formData.vendorSigner} 
                onChange={e => setFormData(p => ({ ...p, vendorSigner: e.target.value }))} 
                placeholder="e.g., John Smith, Director" 
              />
              <div className="mt-2 flex items-center gap-2 text-sm">
                <input 
                  id="vendorSigned" 
                  type="checkbox" 
                  className="h-4 w-4" 
                  checked={formData.vendorSigned} 
                  onChange={(e) => setFormData(p => ({ ...p, vendorSigned: e.target.checked }))} 
                />
                <Label htmlFor="vendorSigned">Vendor Signed</Label>
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="contract-file">Upload Contract (PDF/DOCX)</Label>
            <Input 
              id="contract-file" 
              type="file" 
              accept=".pdf,.doc,.docx" 
              onChange={e => setPdfFile(e.target.files ? e.target.files[0] : null)} 
              className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
            />
            {(pdfFile || (contract?.pdfFileName && isEditing)) && (
              <div className="mt-2 text-sm text-muted-foreground flex items-center">
                <FileText className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">Current: {pdfFile?.name || contract?.pdfFileName}</span>
              </div>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="submit">
              {contract ? 'Update Contract' : 'Create Contract'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            * Required fields. Tip: When you wire DocuSign/AdobeSign callbacks, set the signature checkboxes and the status will auto-advance.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default DetailedContractManagement;