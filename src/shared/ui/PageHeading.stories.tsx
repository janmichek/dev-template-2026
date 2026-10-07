import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageHeading } from './PageHeading';

const meta = {
  component: PageHeading,
} satisfies Meta<typeof PageHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Transactions' },
};
