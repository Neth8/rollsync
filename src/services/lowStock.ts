import { supabase } from '../lib/supabase';

export type DropdownOption = {
  id: string;
  value: string;
};

export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

export type LowStockItem = {
  id: string;
  display_id: string;
  name: string;
  type: string;
  ups: string;
  pcs: string;
  stock: string;
  order: string;
  remark: string;
  is_high_priority: boolean;
  created_at: string;
  created_by: string;
  manager_approval: ApprovalStatus | null;
  manager_remarks: string | null;
};

const dropdownTables = {
  names: 'rollsync_low_stock_names',
  types: 'rollsync_low_stock_types',
  ups: 'rollsync_low_stock_ups',
  pcs: 'rollsync_low_stock_pcs',
} as const;

export async function getDropdownOptions(key: keyof typeof dropdownTables) {
  const { data, error } = await supabase
    .from(dropdownTables[key])
    .select('id, value')
    .eq('is_active', true)
    .order('value', { ascending: true });

  if (error) throw error;
  return (data ?? []) as DropdownOption[];
}

export async function createDropdownOption(key: keyof typeof dropdownTables, value: string) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not found.');

  const { data, error } = await supabase
    .from(dropdownTables[key])
    .insert([{ value: value.trim(), created_by: userId }])
    .select('id, value')
    .single();

  if (error) throw error;
  return data as DropdownOption;
}

export async function getLowStockItems() {
  const { data, error } = await supabase
    .from('rollsync_low_stock_items')
    .select(`
      id,
      display_id,
      name,
      type,
      ups,
      pcs,
      stock,
      order,
      remark,
      is_high_priority,
      created_at,
      created_by,
      manager_approval,
      manager_remarks
    `)
    .order('is_high_priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getLowStockItems error:', error);
    throw error;
  }

  return (data ?? []) as LowStockItem[];
}

export async function createLowStockItem(payload: {
  name: string;
  type: string;
  ups: string;
  pcs: string;
  stock: string;
  order: string;
  remark: string;
  is_high_priority: boolean;
}) {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User not found.');

  const { data, error } = await supabase
    .from('rollsync_low_stock_items')
    .insert([
      {
        ...payload,
        created_by: userId,
        manager_approval: 'pending',
        manager_remarks: '',
      },
    ])
    .select(`
      id,
      display_id,
      name,
      type,
      ups,
      pcs,
      stock,
      order,
      remark,
      is_high_priority,
      created_at,
      created_by,
      manager_approval,
      manager_remarks
    `)
    .single();

  if (error) {
    console.error('createLowStockItem error:', error);
    throw error;
  }

  return data as LowStockItem;
}

export async function updateLowStockHeadOffice(payload: {
  id: string;
  name: string;
  type: string;
  ups: string;
  pcs: string;
  stock: string;
  order: string;
  remark: string;
  is_high_priority: boolean;
  manager_approval: ApprovalStatus;
  manager_remarks: string;
}) {
  const { data, error } = await supabase
    .from('rollsync_low_stock_items')
    .update({
      name: payload.name,
      type: payload.type,
      ups: payload.ups,
      pcs: payload.pcs,
      stock: payload.stock,
      order: payload.order,
      remark: payload.remark,
      is_high_priority: payload.is_high_priority,
      manager_approval: payload.manager_approval,
      manager_remarks: payload.manager_remarks,
    })
    .eq('id', payload.id)
    .select(`
      id,
      display_id,
      name,
      type,
      ups,
      pcs,
      stock,
      order,
      remark,
      is_high_priority,
      created_at,
      created_by,
      manager_approval,
      manager_remarks
    `)
    .single();

  if (error) {
    console.error('updateLowStockHeadOffice error:', error);
    throw error;
  }

  return data as LowStockItem;
}