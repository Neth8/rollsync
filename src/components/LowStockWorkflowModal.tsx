import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { LowStockItem } from '../services/lowStock';

export type ApprovalStatus = 'approved' | 'pending' | 'rejected';
export type WorkflowTab = 'head-office' | 'factory-scheduling' | 'factory-production' | 'closing';

export type LowStockWorkflowItem = LowStockItem & {
  manager_approval?: ApprovalStatus | null;
  manager_remarks?: string | null;
};

type LowStockWorkflowModalProps = {
  item: LowStockWorkflowItem | null;
  open: boolean;
  onClose: () => void;
  onSaveHeadOffice: (updatedItem: LowStockWorkflowItem) => void;
  saving?: boolean;
};

const workflowTabs: Array<{ key: WorkflowTab; label: string }> = [
  { key: 'head-office', label: 'Head Office' },
  { key: 'factory-scheduling', label: 'Factory Scheduling' },
  { key: 'factory-production', label: 'Factory Production' },
  { key: 'closing', label: 'Closing' },
];

export function LowStockWorkflowModal({
  item,
  open,
  onClose,
  onSaveHeadOffice,
  saving = false,
}: LowStockWorkflowModalProps) {
  const [activeTab, setActiveTab] = useState<WorkflowTab>('head-office');
  const [formData, setFormData] = useState<LowStockWorkflowItem | null>(item);

  useEffect(() => {
    if (open) {
      setActiveTab('head-office');
      setFormData(
        item
          ? {
              ...item,
              manager_approval: item.manager_approval ?? 'pending',
              manager_remarks: item.manager_remarks ?? '',
            }
          : null,
      );
    }
  }, [item, open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  const modalTitle = useMemo(() => {
    if (!formData) return 'Low Stock Workflow';
    return `${formData.name} • ${formData.display_id}`;
  }, [formData]);

  if (!open || !formData) return null;

  const handleChange = <K extends keyof LowStockWorkflowItem>(
    key: K,
    value: LowStockWorkflowItem[K],
  ) => {
    setFormData((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData) return;
    onSaveHeadOffice(formData);
    onClose();
  };

  return (
    <div className="workflow-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="workflow-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workflow-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="workflow-modal-header">
          <div>
            <span className="eyebrow">Low stock workflow</span>
            <h2 id="workflow-modal-title">{modalTitle}</h2>
            <p>Review the selected item and continue each department process from one place.</p>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close workflow modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="workflow-tab-strip" role="tablist" aria-label="Low stock workflow tabs">
          {workflowTabs.map((tab) => {
            const selected = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${tab.key}-panel`}
                id={`${tab.key}-tab`}
                className={selected ? 'workflow-tab active' : 'workflow-tab'}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          id={`${activeTab}-panel`}
          role="tabpanel"
          aria-labelledby={`${activeTab}-tab`}
          className="workflow-tab-panel"
          tabIndex={0}
        >
          {activeTab === 'head-office' ? (
            <form className="workflow-form" onSubmit={handleSubmit}>
              <div className="workflow-form-grid">
                <label>
                  <span>Name</span>
                  <input
                    value={formData.name}
                    onChange={(event) => handleChange('name', event.target.value)}
                    placeholder="Item name"
                  />
                </label>

                <label>
                  <span>Type</span>
                  <input
                    value={formData.type}
                    onChange={(event) => handleChange('type', event.target.value)}
                    placeholder="Item type"
                  />
                </label>

                <label>
                  <span>UPS</span>
                  <input
                    value={formData.ups}
                    onChange={(event) => handleChange('ups', event.target.value)}
                    placeholder="UPS"
                  />
                </label>

                <label>
                  <span>PCS</span>
                  <input
                    value={formData.pcs}
                    onChange={(event) => handleChange('pcs', event.target.value)}
                    placeholder="PCS"
                  />
                </label>

                <label>
                  <span>Stock</span>
                  <input
                    value={formData.stock}
                    onChange={(event) => handleChange('stock', event.target.value)}
                    placeholder="Current stock"
                  />
                </label>

                <label>
                  <span>Order</span>
                  <input
                    value={formData.order}
                    onChange={(event) => handleChange('order', event.target.value)}
                    placeholder="Required order"
                  />
                </label>

                <label>
                  <span>Priority</span>
                  <select
                    value={formData.is_high_priority ? 'high' : 'normal'}
                    onChange={(event) =>
                      handleChange('is_high_priority', event.target.value === 'high')
                    }
                  >
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                  </select>
                </label>

                <label>
                  <span>Manager Approval</span>
                  <select
                    value={formData.manager_approval ?? 'pending'}
                    onChange={(event) =>
                      handleChange(
                        'manager_approval',
                        event.target.value as LowStockWorkflowItem['manager_approval'],
                      )
                    }
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </label>
              </div>

              <label className="workflow-textarea">
                <span>Remarks</span>
                <textarea
                  value={formData.remark}
                  onChange={(event) => handleChange('remark', event.target.value)}
                  placeholder="Item remarks"
                />
              </label>

              <label className="workflow-textarea">
                <span>Manager Remarks</span>
                <textarea
                  value={formData.manager_remarks ?? ''}
                  onChange={(event) => handleChange('manager_remarks', event.target.value)}
                  placeholder="Manager remarks"
                />
              </label>

              <div className="workflow-meta-row">
                <div className="workflow-meta-card">
                  <span>Item ID</span>
                  <strong>{formData.display_id}</strong>
                </div>

                <div className="workflow-meta-card">
                  <span>Added By</span>
                  <strong>{formData.created_by}</strong>
                </div>
              </div>

              <div className="workflow-actions">
                <button type="button" className="tab-button" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={saving}>
  {saving ? 'Saving Head Office...' : 'Save Head Office'}
</button>
              </div>
            </form>
          ) : (
            <div className="workflow-placeholder">
              <h3>Coming next</h3>
              <p>
                This tab is reserved for the next implementation step after Head Office is completed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}