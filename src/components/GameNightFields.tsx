import { TextInput, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';

// Structural subset of Mantine's UseFormReturnType, so any form that has
// `date`, `location` and `notes` fields can reuse these inputs.
// Method syntax keeps the parameter check bivariant (typed paths are accepted).
type FieldsForm = {
  key(path: 'date' | 'location' | 'notes'): string;
  getInputProps(path: 'date' | 'location' | 'notes'): object;
};

export default function GameNightFields({ form }: { form: FieldsForm }) {
  return (
    <>
      <DateInput label="Date" withAsterisk valueFormat="DD/MM/YYYY" key={form.key('date')} {...form.getInputProps('date')} />
      <TextInput label="Lieu" key={form.key('location')} {...form.getInputProps('location')} />
      <Textarea label="Notes" autosize minRows={2} key={form.key('notes')} {...form.getInputProps('notes')} />
    </>
  );
}
