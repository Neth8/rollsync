import { useMemo, useState } from 'react';
import {
  defaultPrinterSettings,
  loadPrinterSettings,
  savePrinterSettings,
  searchBluetoothPrinter,
  searchWifiPrinters,
  testPrint,
  type DiscoveredWifiPrinter,
  type PrinterConnection,
  type PrinterLanguage,
  type PrinterSettings,
} from '../services/printer';

export function PrinterSettingsPanel() {
  const [settings, setSettings] = useState<PrinterSettings>(() => loadPrinterSettings());
  const [saving, setSaving] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [searchingBt, setSearchingBt] = useState(false);
  const [searchingWifi, setSearchingWifi] = useState(false);
  const [wifiResults, setWifiResults] = useState<DiscoveredWifiPrinter[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const canSave = useMemo(() => {
    if (!settings.enabled) return true;
    if (settings.connection === 'wifi') {
      return settings.host.trim() && settings.port.trim();
    }
    if (settings.connection === 'bluetooth') {
      return settings.bluetoothName.trim().length > 0;
    }
    return settings.printerName.trim().length > 0 || settings.connection !== 'windows';
  }, [settings]);

  function update<K extends keyof PrinterSettings>(key: K, value: PrinterSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    try {
      setSaving(true);
      setError('');
      setMessage('');
      savePrinterSettings(settings);
      setMessage('Printer settings saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save printer settings.');
    } finally {
      setSaving(false);
    }
  }

  async function handleTestPrint() {
    try {
      setPrinting(true);
      setError('');
      setMessage('');
      await testPrint(settings);
      setMessage('Test label sent successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to print test label.');
    } finally {
      setPrinting(false);
    }
  }

  async function handleSearchBluetooth() {
    try {
      setSearchingBt(true);
      setError('');
      setMessage('');
      const device = await searchBluetoothPrinter();
      setSettings((prev) => ({
        ...prev,
        connection: 'bluetooth',
        bluetoothName: device.name,
        bluetoothId: device.id,
      }));
      setMessage(`Bluetooth device selected: ${device.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search Bluetooth printers.');
    } finally {
      setSearchingBt(false);
    }
  }

  async function handleSearchWifi() {
    try {
      setSearchingWifi(true);
      setError('');
      setMessage('');
      const results = await searchWifiPrinters();
      setWifiResults(results);
      if (results.length === 0) {
        setMessage('No Wi-Fi printers found on the current network.');
      } else {
        setMessage(`Found ${results.length} Wi-Fi printer(s).`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search Wi-Fi printers.');
    } finally {
      setSearchingWifi(false);
    }
  }

  function handleSelectWifiPrinter(printer: DiscoveredWifiPrinter) {
    setSettings((prev) => ({
      ...prev,
      connection: 'wifi',
      printerName: printer.name,
      host: printer.host,
      port: String(printer.port ?? 9100),
    }));
    setMessage(`Selected Wi-Fi printer: ${printer.name}`);
  }

  function handleReset() {
    setSettings(defaultPrinterSettings);
    setWifiResults([]);
    setError('');
    setMessage('');
  }

  return (
    <section className="low-stock-form-card">
      <div className="section-heading-row">
        <div>
          <h3>Label printer</h3>
          <p className="settings-help-text">
            Configure Gainscha TSPL/ZPL printers for PC and Android workflows.
          </p>
        </div>
      </div>

      <div className="printer-search-actions">
        <button className="tab-button" type="button" onClick={handleSearchBluetooth} disabled={searchingBt}>
          {searchingBt ? 'Searching BT...' : 'Search BT printer'}
        </button>

        <button className="tab-button" type="button" onClick={handleSearchWifi} disabled={searchingWifi}>
          {searchingWifi ? 'Searching Wi-Fi...' : 'Search Wi-Fi printers'}
        </button>
      </div>

      {wifiResults.length > 0 ? (
        <div className="printer-discovery-list">
          {wifiResults.map((printer) => (
            <button
              key={`${printer.name}-${printer.host}`}
              type="button"
              className="settings-option-row printer-discovery-item"
              onClick={() => handleSelectWifiPrinter(printer)}
            >
              <strong>{printer.name}</strong>
              <span>{printer.host}:{printer.port ?? 9100}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="low-stock-form-grid">
        <label className="checkbox-field">
          <span>Enable label printing</span>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(event) => update('enabled', event.target.checked)}
          />
        </label>

        <label>
          <span>Printer language</span>
          <select
            value={settings.language}
            onChange={(event) => update('language', event.target.value as PrinterLanguage)}
          >
            <option value="tspl">TSPL</option>
            <option value="zpl">ZPL</option>
          </select>
        </label>

        <label>
          <span>Connection type</span>
          <select
            value={settings.connection}
            onChange={(event) => update('connection', event.target.value as PrinterConnection)}
          >
            <option value="windows">Windows installed printer</option>
            <option value="usb">USB</option>
            <option value="bluetooth">Bluetooth</option>
            <option value="wifi">Wi-Fi / LAN</option>
          </select>
        </label>

        {settings.connection === 'wifi' ? (
          <>
            <label>
              <span>Printer IP / Host</span>
              <input
                type="text"
                value={settings.host}
                onChange={(event) => update('host', event.target.value)}
                placeholder="192.168.1.120"
              />
            </label>

            <label>
              <span>Port</span>
              <input
                type="text"
                value={settings.port}
                onChange={(event) => update('port', event.target.value)}
                placeholder="9100"
              />
            </label>
          </>
        ) : settings.connection === 'bluetooth' ? (
          <>
            <label>
              <span>Bluetooth printer name</span>
              <input
                type="text"
                value={settings.bluetoothName}
                onChange={(event) => update('bluetoothName', event.target.value)}
                placeholder="Selected Bluetooth device"
              />
            </label>

            <label>
              <span>Bluetooth device id</span>
              <input
                type="text"
                value={settings.bluetoothId}
                onChange={(event) => update('bluetoothId', event.target.value)}
                placeholder="Browser device id"
              />
            </label>
          </>
        ) : (
          <label>
            <span>Printer name</span>
            <input
              type="text"
              value={settings.printerName}
              onChange={(event) => update('printerName', event.target.value)}
              placeholder="Enter installed printer name"
            />
          </label>
        )}

        <label>
          <span>Label width (mm)</span>
          <input
            type="number"
            value={settings.paperWidthMm}
            onChange={(event) => update('paperWidthMm', Number(event.target.value))}
          />
        </label>

        <label>
          <span>Label height (mm)</span>
          <input
            type="number"
            value={settings.paperHeightMm}
            onChange={(event) => update('paperHeightMm', Number(event.target.value))}
          />
        </label>

        <label>
          <span>Darkness / density</span>
          <input
            type="text"
            value={settings.darkness}
            onChange={(event) => update('darkness', event.target.value)}
            placeholder="8"
          />
        </label>

        <label>
          <span>Speed</span>
          <input
            type="text"
            value={settings.speed}
            onChange={(event) => update('speed', event.target.value)}
            placeholder="4"
          />
        </label>

        <label>
          <span>Copies</span>
          <input
            type="number"
            min={1}
            value={settings.copies}
            onChange={(event) => update('copies', Number(event.target.value))}
          />
        </label>
      </div>

      {message ? <p className="form-success">{message}</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <div className="printer-actions">
        <button className="tab-button" type="button" onClick={handleReset}>
          Reset
        </button>
        <button className="tab-button" type="button" onClick={handleTestPrint} disabled={printing}>
          {printing ? 'Printing test...' : 'Print test label'}
        </button>
        <button className="primary-button" type="button" onClick={handleSave} disabled={!canSave || saving}>
          {saving ? 'Saving...' : 'Save printer settings'}
        </button>
      </div>
    </section>
  );
}