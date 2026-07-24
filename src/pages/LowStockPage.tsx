import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Plus } from 'lucide-react';
import {
  createLowStockItem,
  getDropdownOptions,
  getLowStockItems,
  type DropdownOption,
  type LowStockItem,
} from '../services/lowStock';

type InnerTab = 'currently-low';

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
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>(initialForm);

  const [names, setNames] = useState<DropdownOption[]>([]);
  const [types, setTypes] = useState<DropdownOption[]>([]);
  const [upsOptions, setUpsOptions] = useState<DropdownOption[]>([]);
  const [pcsOptions, setPcsOptions] = useState<DropdownOption[]>([]);

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

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">Low stock</span>
          <h1>Track items that need ordering now.</h1>
          <p>
            Name, type, up&apos;s, and pcs come from settings. Stock, order, and remark are entered directly here.
          </p>
        </div>

        <div className="hero-card">
          <span>Total low items</span>
          <strong>{items.length}</strong>
        </div>
      </div>

      <div className="tab-strip">
        <button
          type="button"
          className={innerTab === 'currently-low' ? 'tab-button active' : 'tab-button'}
          onClick={() => setInnerTab('currently-low')}
        >
          Currently Low
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
                <select value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}>
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
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
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
                <select value={form.ups} onChange={(e) => setForm((p) => ({ ...p, ups: e.target.value }))}>
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
                <select value={form.pcs} onChange={(e) => setForm((p) => ({ ...p, pcs: e.target.value }))}>
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
                  onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                  placeholder="Enter current stock"
                />
              </label>

              <label>
                <span>Order</span>
                <input
                  type="text"
                  value={form.order}
                  onChange={(e) => setForm((p) => ({ ...p, order: e.target.value }))}
                  placeholder="Enter required order qty"
                />
              </label>

              <label>
                <span>Remark</span>
                <textarea
                  value={form.remark}
                  onChange={(e) => setForm((p) => ({ ...p, remark: e.target.value }))}
                  placeholder="Enter remark"
                  rows={4}
                />
              </label>

              <label className="checkbox-field">
                <span>High priority</span>
                <input
                  type="checkbox"
                  checked={form.is_high_priority}
                  onChange={(e) => setForm((p) => ({ ...p, is_high_priority: e.target.checked }))}
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
            ) : items.length === 0 ? (
              <div className="hero-card">No currently low stock items saved yet.</div>
            ) : (
                items.map((item) => (
  <article
    key={item.id}
    className={item.is_high_priority ? 'low-stock-card high-priority' : 'low-stock-card'}
  >
    <div className="low-stock-card-head">
      <h3>{item.name}</h3>
      {item.is_high_priority ? <span className="priority-badge">High Priority</span> : null}
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
        <strong>{item.stock} / {item.order}</strong>
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
      ) : null}
    </section>
  );
}