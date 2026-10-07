import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { CountrySelect } from './CountrySelect';

const meta = {
  component: CountrySelect,
  args: { value: undefined, onChange: () => {} },

  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <CountrySelect {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof CountrySelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Preselected: Story = {
  args: { value: 'CZ' },
};

export const Disabled: Story = {
  args: { value: 'GB', disabled: true },
};
