import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';

export default function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  // Resolves 'auto' to the actual scheme, so the icon always matches what is shown.
  const computed = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const next = computed === 'light' ? 'dark' : 'light';

  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      size="lg"
      aria-label={next === 'dark' ? 'Activer le mode sombre' : 'Activer le mode clair'}
      onClick={() => setColorScheme(next)}
    >
      {next === 'dark' ? '☾' : '☀'}
    </ActionIcon>
  );
}
