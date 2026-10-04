// Asset column mappings and labels matching Google Sheet 'Sheet1'
export const ASSET_COLUMNS = [
  { key: 'Asset1', label: 'MONITER', category: 'Display', icon: 'Monitor' },
  { key: 'Asset2', label: 'CPU', category: 'Computing', icon: 'Cpu' },
  { key: 'Asset3', label: 'THIN CLIENT', category: 'Computing', icon: 'HardDrive' },
  { key: 'Asset4', label: 'KEYBOARD', category: 'Peripherals', icon: 'Keyboard' },
  { key: 'Asset5', label: 'MOUSE', category: 'Peripherals', icon: 'Mouse' },
  { key: 'Asset6', label: 'UPS', category: 'Power', icon: 'BatteryCharging' },
  { key: 'Asset7', label: 'INTERCOM', category: 'Communication', icon: 'PhoneCall' },
  { key: 'Asset8', label: 'PRINTER', category: 'Printing', icon: 'Printer' },
  { key: 'Asset9', label: 'NUC', category: 'Computing', icon: 'Box' },
  { key: 'Asset10', label: 'DOT MATRIX', category: 'Printing', icon: 'FileText' },
  { key: 'Asset11', label: 'LAPTOP', category: 'Computing', icon: 'Laptop' },
  { key: 'Asset12', label: 'TAB', category: 'Mobile', icon: 'Tablet' },
  { key: 'Asset13', label: 'TV', category: 'Display', icon: 'Tv' },
  { key: 'Asset14', label: 'SERVER', category: 'Infrastructure', icon: 'Server' },
];

export const SHEET1_HEADERS = [
  'Tag No',
  'Entity',
  'Location',
  'User Name',
  'System IP',
  'Asset1',
  'Asset2',
  'Asset3',
  'Asset4',
  'Asset5',
  'Asset6',
  'Asset7',
  'Asset8',
  'Asset9',
  'Asset10',
  'Asset11',
  'Asset12',
  'Asset13',
  'Asset14'
];

// Presets for rapid assignment
export const ASSET_PRESETS = [
  {
    id: 'desktop',
    name: 'Desktop Standard',
    description: 'Monitor, CPU, Keyboard, Mouse & UPS',
    assets: ['Asset1', 'Asset2', 'Asset4', 'Asset5', 'Asset6']
  },
  {
    id: 'laptop_bundle',
    name: 'Laptop Mobility',
    description: 'Laptop & Mouse',
    assets: ['Asset11', 'Asset5']
  },
  {
    id: 'developer_rig',
    name: 'Power Developer',
    description: 'Laptop, Monitor, Keyboard, Mouse & UPS',
    assets: ['Asset11', 'Asset1', 'Asset4', 'Asset5', 'Asset6']
  },
  {
    id: 'thin_client',
    name: 'Thin Client Station',
    description: 'Thin Client, Monitor, Keyboard, Mouse',
    assets: ['Asset3', 'Asset1', 'Asset4', 'Asset5']
  },
  {
    id: 'server_rack',
    name: 'Server Infrastructure',
    description: 'Server & UPS',
    assets: ['Asset14', 'Asset6']
  }
];

// Suggested entities and locations (empty by default; populated dynamically from Masters sheet)
export const SUGGESTED_ENTITIES = [];
export const SUGGESTED_LOCATIONS = [];

// Empty initial records (clean start with 0 demo data)
export const INITIAL_SAMPLE_RECORDS = [];

