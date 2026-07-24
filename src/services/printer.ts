/// <reference types="web-bluetooth" />

export type PrinterLanguage = 'tspl' | 'zpl';
export type PrinterConnection = 'usb' | 'bluetooth' | 'wifi' | 'windows';

export type PrinterSettings = {
  enabled: boolean;
  printerName: string;
  language: PrinterLanguage;
  connection: PrinterConnection;
  paperWidthMm: number;
  paperHeightMm: number;
  host: string;
  port: string;
  darkness: string;
  speed: string;
  copies: number;
  bluetoothName: string;
  bluetoothId: string;
};

export type LabelPayload = {
  title: string;
  subtitle?: string;
  barcode: string;
  qr?: string;
  footer?: string;
};

export type DiscoveredWifiPrinter = {
  name: string;
  host: string;
  port?: number;
};

type BluetoothNavigator = Navigator & {
  bluetooth?: Bluetooth;
};

const STORAGE_KEY = 'rollsync_printer_settings';

export const defaultPrinterSettings: PrinterSettings = {
  enabled: false,
  printerName: '',
  language: 'tspl',
  connection: 'windows',
  paperWidthMm: 50,
  paperHeightMm: 25,
  host: '',
  port: '9100',
  darkness: '8',
  speed: '4',
  copies: 1,
  bluetoothName: '',
  bluetoothId: '',
};

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadPrinterSettings(): PrinterSettings {
  try {
    if (!canUseBrowserStorage()) {
      return defaultPrinterSettings;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPrinterSettings;

    const parsed = JSON.parse(raw) as Partial<PrinterSettings>;
    return { ...defaultPrinterSettings, ...parsed };
  } catch {
    return defaultPrinterSettings;
  }
}

export function savePrinterSettings(settings: PrinterSettings) {
  if (!canUseBrowserStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function esc(value: string) {
  return String(value ?? '').replace(/"/g, "'");
}

export function buildTsplLabel(settings: PrinterSettings, payload: LabelPayload) {
  const widthInch = (settings.paperWidthMm / 25.4).toFixed(2);
  const heightInch = (settings.paperHeightMm / 25.4).toFixed(2);

  const lines = [
    `SIZE ${widthInch},${heightInch}`,
    'GAP 2 mm,0 mm',
    'DIRECTION 1',
    `DENSITY ${settings.darkness || '8'}`,
    `SPEED ${settings.speed || '4'}`,
    'CLS',
    `TEXT 20,20,"3",0,1,1,"${esc(payload.title)}"`,
  ];

  if (payload.subtitle) {
    lines.push(`TEXT 20,55,"2",0,1,1,"${esc(payload.subtitle)}"`);
  }

  lines.push(`BARCODE 20,95,"128",60,1,0,2,2,"${esc(payload.barcode)}"`);

  if (payload.qr) {
    lines.push(`QRCODE 300,20,L,5,A,0,"${esc(payload.qr)}"`);
  }

  if (payload.footer) {
    lines.push(`TEXT 20,170,"2",0,1,1,"${esc(payload.footer)}"`);
  }

  lines.push(`PRINT ${Math.max(1, settings.copies || 1)}`);

  return lines.join('\r\n');
}

export function buildZplLabel(settings: PrinterSettings, payload: LabelPayload) {
  const widthDots = Math.round((settings.paperWidthMm / 25.4) * 203);
  const heightDots = Math.round((settings.paperHeightMm / 25.4) * 203);

  const parts = [
    '^XA',
    `^PW${widthDots}`,
    `^LL${heightDots}`,
    '^CI28',
    `^FO20,20^A0N,32,32^FD${esc(payload.title)}^FS`,
  ];

  if (payload.subtitle) {
    parts.push(`^FO20,60^A0N,24,24^FD${esc(payload.subtitle)}^FS`);
  }

  parts.push('^BY2,2,60');
  parts.push(`^FO20,95^BCN,60,Y,N,N^FD${esc(payload.barcode)}^FS`);

  if (payload.qr) {
    parts.push(`^FO300,20^BQN,2,5^FDQA,${esc(payload.qr)}^FS`);
  }

  if (payload.footer) {
    parts.push(`^FO20,175^A0N,22,22^FD${esc(payload.footer)}^FS`);
  }

  parts.push(`^PQ${Math.max(1, settings.copies || 1)},0,1,N`);
  parts.push('^XZ');

  return parts.join('\n');
}

export function buildLabelCommand(settings: PrinterSettings, payload: LabelPayload) {
  return settings.language === 'zpl'
    ? buildZplLabel(settings, payload)
    : buildTsplLabel(settings, payload);
}

export async function searchBluetoothPrinter() {
  if (typeof navigator === 'undefined') {
    throw new Error('Bluetooth search is only available in the browser.');
  }

  const nav = navigator as BluetoothNavigator;

  if (!nav.bluetooth) {
    throw new Error('Bluetooth is not supported in this browser.');
  }

  const device = await nav.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: [],
  });

  return {
    id: device.id ?? '',
    name: device.name ?? 'Bluetooth printer',
  };
}

export async function searchWifiPrinters(): Promise<DiscoveredWifiPrinter[]> {
  const response = await fetch('http://localhost:4319/discover-printers', {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Printer discovery helper is not running.');
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(
    (item): item is DiscoveredWifiPrinter =>
      typeof item === 'object' &&
      item !== null &&
      'name' in item &&
      'host' in item &&
      typeof (item as DiscoveredWifiPrinter).name === 'string' &&
      typeof (item as DiscoveredWifiPrinter).host === 'string',
  );
}

export async function printLabel(settings: PrinterSettings, payload: LabelPayload) {
  const commands = buildLabelCommand(settings, payload);

  if (settings.connection === 'wifi' && settings.host.trim()) {
    const response = await fetch('/api/printer/raw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: settings.host.trim(),
        port: Number(settings.port || '9100'),
        language: settings.language,
        commands,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to print over network.');
    }

    return;
  }

  const helperResponse = await fetch('http://localhost:4319/print', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      printerName: settings.printerName,
      language: settings.language,
      connection: settings.connection,
      bluetoothName: settings.bluetoothName,
      bluetoothId: settings.bluetoothId,
      commands,
    }),
  });

  if (!helperResponse.ok) {
    throw new Error('Print helper is not running or printer is unavailable.');
  }
}

export async function testPrint(settings: PrinterSettings) {
  return printLabel(settings, {
    title: 'RollSync Test',
    subtitle: `${settings.language.toUpperCase()} label`,
    barcode: 'RS-TEST-001',
    qr: 'RS-TEST-001',
    footer: 'Printer connection successful',
  });
}