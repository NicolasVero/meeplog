import { useState } from 'react';
import { Group, Rating, Text, type RatingProps } from '@mantine/core';

/** Editable star rating that shows the hovered (or current) value next to the stars. */
export default function RatingInput({ count = 10, value = 0, ...props }: RatingProps) {
  const [hovered, setHovered] = useState(-1);
  const shown = hovered > 0 ? hovered : value;

  return (
    <Group gap="xs" wrap="nowrap">
      <Rating count={count} value={value} onHover={setHovered} {...props} />
      <Text size="sm" c={hovered > 0 ? undefined : 'dimmed'} fw={hovered > 0 ? 600 : undefined} w={40} ta="right">
        {shown > 0 ? `${shown}/${count}` : '—'}
      </Text>
    </Group>
  );
}
