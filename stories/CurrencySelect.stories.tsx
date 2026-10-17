import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { CurrencySelect } from '../src/features/filter-currency';

const meta = {
  component: CurrencySelect,
  args: { value: undefined, onChange: () => {} },
  // the select is controlled, so the story holds the picked value
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <CurrencySelect {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof CurrencySelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Preselected: Story = {
  args: { value: 'BTC' },
};

export const Disabled: Story = {
  args: { value: 'ETH', disabled: true },
};
