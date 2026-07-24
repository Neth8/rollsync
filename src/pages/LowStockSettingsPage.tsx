import { useEffect, useState } from 'react';
import { createDropdownOption, getDropdownOptions, type DropdownOption } from '../services/lowStock';

type SettingKey = 'names' | 'types' | 'ups' | 'pcs';

const labels: Record<SettingKey, string> = {
  names: 'Names',
  types: 'Types',
  ups: "Up's",
  pcs: 'Pcs',
};

export function LowStockSettingsPage() {
  const [activeKey, setActiveKey] = useState<SettingKey>('names');
  const [items, setItems] = useState<DropdownOption[]>([]);
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void load(activeKey);
  }, [activeKey]);

  async function load(key: SettingKey) {
    try {
      setLoading(true);
      const data = await getDropdownOptions(key);
      setItems(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!value.trim()) return;

    try {
      setSaving(true);
      const created = await createDropdownOption(activeKey, value);
      setItems((prev) => [...prev, created].sort((a, b) => a.value.localeCompare(b.value)));
      setValue('');
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save option.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">Settings</span>
          <h1>Manage low stock dropdown values.</h1>
          <p>Only name, type, up&apos;s, and pcs are controlled from settings.</p>
        </div>
      </div>

      <div className="low-stock-settings-layout">
        <div className="settings-tab-list">
          {(Object.keys(labels) as SettingKey[]).map((key) => (
            <button
              key={key}
              type="button"
              className={activeKey === key ? 'tab-button active' : 'tab-button'}
              onClick={() => setActiveKey(key)}
            >
              {labels[key]}
            </button>
          ))}
        </div>

        <div className="low-stock-form-card">
          <h3>Add {labels[activeKey]}</h3>

          <form className="inline-form" onSubmit={handleAdd}>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Add ${labels[activeKey].toLowerCase()} value`}
            />
            <button className="primary-button" type="submit" disabled={saving || !value.trim()}>
              {saving ? 'Saving...' : 'Add'}
            </button>
          </form>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="settings-option-list">
            {loading ? (
              <div className="hero-card">Loading...</div>
            ) : items.length === 0 ? (
              <div className="hero-card">No values added yet.</div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="settings-option-row">
                  <span>{item.value}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}