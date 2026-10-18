import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { MakeSelect } from '../src/features/filter-make';

const meta = {
  component: MakeSelect,
  args: { value: undefined, onChange: () => {} },
  // the select is controlled, so the story holds the picked value
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <MakeSelect {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof MakeSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Preselected: Story = {
  args: { value: 'TOY' },
};

export const Disabled: Story = {
  args: { value: 'BMW', disabled: true },
};
