import { Card, createTheme, Paper, Table, type MantineColorsTuple } from '@mantine/core';

// Deep blue with a hint of indigo: calm, readable on white, still vivid in dark mode.
// Generated with https://mantine.dev/colors-generator/ (base #4263eb).
const brand: MantineColorsTuple = [
  '#edf2ff',
  '#dbe4ff',
  '#bac8ff',
  '#91a7ff',
  '#748ffc',
  '#5c7cfa',
  '#4c6ef5',
  '#4263eb',
  '#3b5bdb',
  '#364fc7',
];

const fontFamily = "'Inter Variable', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export const theme = createTheme({
  colors: { brand },
  primaryColor: 'brand',
  primaryShade: { light: 7, dark: 5 },
  defaultRadius: 'md',
  cursorType: 'pointer',

  fontFamily,
  headings: {
    fontFamily,
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '1.75rem', lineHeight: '1.3' },
      h2: { fontSize: '1.25rem', lineHeight: '1.35' },
    },
  },

  shadows: {
    xs: '0 1px 2px rgba(16, 24, 40, 0.05)',
    sm: '0 1px 3px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16, 24, 40, 0.04)',
  },

  components: {
    Card: Card.extend({ defaultProps: { withBorder: true, shadow: 'xs', radius: 'md' } }),
    Paper: Paper.extend({ defaultProps: { shadow: 'xs' } }),
    Table: Table.extend({ defaultProps: { highlightOnHover: true } }),
  },
});
