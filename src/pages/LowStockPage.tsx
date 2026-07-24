import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import {
  createLowStockItem,
  getDropdownOptions,
  getLowStockItems,
  updateLowStockHeadOffice,
  type DropdownOption,
  type LowStockItem,
} from '../services/lowStock';
import { LowStockWorkflowModal } from '../components/LowStockWorkflowModal';

type InnerTab = 'currently-low' | 'manager-approved';

type FormState = {
  name: string;
  type: string;
  ups: string;
  pcs: string;
  stock: string;
  order: string;
  remark: string;
  is_high_priority: boolean;
};

const initialForm: FormState = {
  name: '',
  type: '',
  ups: '',
  pcs: '',
  stock: '',
  order: '',
  remark: '',
  is_high_priority: false,
};

export function LowStockPage() {
  const [innerTab, setInnerTab] = useState<InnerTab>('currently-low');
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>(initialForm);

  const [names, setNames] = useState<DropdownOption[]>([]);
  const [types, setTypes] = useState<DropdownOption[]>([]);
  const [upsOptions, setUpsOptions] = useState<DropdownOption[]>([]);
  const [pcsOptions, setPcsOptions] = useState<DropdownOption[]>([]);

  const [selectedItem, setSelectedItem] = useState<LowStockItem | null>(null);

  useEffect(() => {
    void loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      const [loadedItems, loadedNames, loadedTypes, loadedUps, loadedPcs] = await Promise.all([
        getLowStockItems(),
        getDropdownOptions('names'),
        getDropdownOptions('types'),
        getDropdownOptions('ups'),
        getDropdownOptions('pcs'),
      ]);

      setItems(loadedItems);
      setNames(loadedNames);
      setTypes(loadedTypes);
      setUpsOptions(loadedUps);
      setPcsOptions(loadedPcs);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load low stock data.');
    } finally {
      setLoading(false);
    }
  }

  const canSave = useMemo(() => {
    return (
      form.name.trim() &&
      form.type.trim() &&
      form.ups.trim() &&
      form.pcs.trim() &&
      form.stock.trim() &&
      form.order.trim() &&
      form.remark.trim()
    );
  }, [form]);

  const currentlyLowItems = useMemo(() => {
    return items.filter((item) => item.manager_approval !== 'approved');
  }, [items]);

  const managerApprovedItems = useMemo(() => {
    return items.filter((item) => item.manager_approval === 'approved');
  }, [items]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    try {
      setSaving(true);
      setError('');

      const created = await createLowStockItem({
        ...form,
        stock: form.stock.trim(),
        order: form.order.trim(),
        remark: form.remark.trim(),
      });

      setItems((prev) => [created, ...prev]);
      setForm(initialForm);
      setInnerTab('currently-low');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveHeadOffice(updatedItem: LowStockItem) {
    try {
      setModalSaving(true);
      setError('');

      const saved = await updateLowStockHeadOffice({
        id: updatedItem.id,
        name: updatedItem.name,
        type: updatedItem.type,
        ups: updatedItem.ups,
        pcs: updatedItem.pcs,
        stock: updatedItem.stock,
        order: updatedItem.order,
        remark: updatedItem.remark,
        is_high_priority: updatedItem.is_high_priority,
        manager_approval: updatedItem.manager_approval ?? 'pending',
        manager_remarks: updatedItem.manager_remarks ?? '',
      });

      setItems((current) => current.map((item) => (item.id === saved.id ? saved : item)));
      setSelectedItem(saved);

      if (saved.manager_approval === 'approved') {
        setInnerTab('manager-approved');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update Head Office details.');
      throw err;
    } finally {
      setModalSaving(false);
    }
  }

  const visibleItems = innerTab === 'manager-approved' ? managerApprovedItems : currentlyLowItems;

  return (
    <section className="dashboard-page">
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">Low stock</span>
          <h1>Track items that need ordering now.</h1>
          <p>
            Name, type, up&apos;s, and pcs come from settings. Stock, order, and remark are entered
            directly here.
          </p>
        </div>

        <div className="hero-card">
          <span>
            {innerTab === 'manager-approved' ? 'Approved items' : 'Total low items'}
          </span>
          <strong>{visibleItems.length}</strong>
        </div>
      </div>

      <div className="tab-strip" role="tablist" aria-label="Low stock status tabs">
        <button
          type="button"
          role="tab"
          aria-selected={innerTab === 'currently-low'}
          className={innerTab === 'currently-low' ? 'tab-button active' : 'tab-button'}
          onClick={() => setInnerTab('currently-low')}
        >
          Currently Low
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={innerTab === 'manager-approved'}
          className={innerTab === 'manager-approved' ? 'tab-button active' : 'tab-button'}
          onClick={() => setInnerTab('manager-approved')}
        >
          Manager Approved
        </button>
      </div>

      {innerTab === 'currently-low' ? (
        <div className="low-stock-layout">
          <form className="low-stock-form-card" onSubmit={handleSave}>
            <div className="section-heading-row">
              <h3>Add low stock item</h3>
              <a className="inline-settings-link" href="/settings">
                <Plus size={16} />
                <span>Manage dropdowns</span>
              </a>
            </div>

            <div className="low-stock-form-grid">
              <label>
                <span>Name</span>
                <select
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                >
                  <option value="">Select name</option>
                  {names.map((item) => (
                    <option key={item.id} value={item.value}>
                      {item.value}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Type</span>
                <select
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
                >
                  <option value="">Select type</option>
                  {types.map((item) => (
                    <option key={item.id} value={item.value}>
                      {item.value}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Up&apos;s</span>
                <select
                  value={form.ups}
                  onChange={(event) => setForm((prev) => ({ ...prev, ups: event.target.value }))}
                >
                  <option value="">Select up&apos;s</option>
                  {upsOptions.map((item) => (
                    <option key={item.id} value={item.value}>
                      {item.value}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Pcs</span>
                <select
                  value={form.pcs}
                  onChange={(event) => setForm((prev) => ({ ...prev, pcs: event.target.value }))}
                >
                  <option value="">Select pcs</option>
                  {pcsOptions.map((item) => (
                    <option key={item.id} value={item.value}>
                      {item.value}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Stock</span>
                <input
                  type="text"
                  value={form.stock}
                  onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                  placeholder="Enter current stock"
                />
              </label>

              <label>
                <span>Order</span>
                <input
                  type="text"
                  value={form.order}
                  onChange={(event) => setForm((prev) => ({ ...prev, order: event.target.value }))}
                  placeholder="Enter required order qty"
                />
              </label>

              <label>
                <span>Remark</span>
                <textarea
                  value={form.remark}
                  onChange={(event) => setForm((prev) => ({ ...prev, remark: event.target.value }))}
                  placeholder="Enter remark"
                  rows={4}
                />
              </label>

              <label className="checkbox-field">
                <span>High priority</span>
                <input
                  type="checkbox"
                  checked={form.is_high_priority}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, is_high_priority: event.target.checked }))
                  }
                />
              </label>
            </div>

            {error ? (
              <p className="form-error low-stock-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </p>
            ) : null}

            <button className="primary-button" type="submit" disabled={!canSave || saving}>
              {saving ? 'Saving item...' : 'Save item'}
            </button>
          </form>

          <div className="low-stock-cards">
            {loading ? (
              <div className="hero-card">Loading low stock items...</div>
            ) : currentlyLowItems.length === 0 ? (
              <div className="hero-card">No currently low stock items waiting for approval.</div>
            ) : (
              currentlyLowItems.map((item) => (
                <article
                  key={item.id}
                  className={item.is_high_priority ? 'low-stock-card high-priority' : 'low-stock-card'}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedItem(item)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedItem(item);
                    }
                  }}
                >
                  <div className="low-stock-card-head">
                    <h3>{item.name}</h3>
                    {item.is_high_priority ? (
                      <span className="priority-badge">High Priority</span>
                    ) : null}
                  </div>

                  <div className="low-stock-card-grid">
                    <div>
                      <span>#ID</span>
                      <strong>{item.display_id}</strong>
                    </div>

                    <div>
                      <span>Name</span>
                      <strong>{item.name}</strong>
                    </div>

                    <div>
                      <span>Type</span>
                      <strong>{item.type}</strong>
                    </div>

                    <div>
                      <span>Pcs</span>
                      <strong>{item.pcs}</strong>
                    </div>

                    <div>
                      <span>Stock / Order</span>
                      <strong>
                        {item.stock} / {item.order}
                      </strong>
                    </div>

                    <div>
                      <span>Added By</span>
                      <strong>{item.created_by}</strong>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="low-stock-approved-layout">
          <div className="low-stock-cards">
            {loading ? (
              <div className="hero-card">Loading approved items...</div>
            ) : managerApprovedItems.length === 0 ? (
              <div className="hero-card">No manager approved items yet.</div>
            ) : (
              managerApprovedItems.map((item) => (
                <article
                  key={item.id}
                  className="low-stock-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedItem(item)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedItem(item);
                    }
                  }}
                >
                  <div className="low-stock-card-head">
                    <h3>{item.name}</h3>
                    <span className="priority-badge priority-badge-approved">Approved</span>
                  </div>

                  <div className="low-stock-card-grid">
                    <div>
                      <span>#ID</span>
                      <strong>{item.display_id}</strong>
                    </div>

                    <div>
                      <span>Name</span>
                      <strong>{item.name}</strong>
                    </div>

                    <div>
                      <span>Type</span>
                      <strong>{item.type}</strong>
                    </div>

                    <div>
                      <span>Pcs</span>
                      <strong>{item.pcs}</strong>
                    </div>

                    <div>
                      <span>Stock / Order</span>
                      <strong>
                        {item.stock} / {item.order}
                      </strong>
                    </div>

                    <div>
                      <span>Added By</span>
                      <strong>{item.created_by}</strong>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      )}

      <LowStockWorkflowModal
        open={Boolean(selectedItem)}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSaveHeadOffice={handleSaveHeadOffice}
        saving={modalSaving}
      />
    </section>
  );
}