import type { Meta, StoryObj } from '@storybook/react-vite';
import { PageHeading } from '../src/shared/ui';

const meta = {
  component: PageHeading,
} satisfies Meta<typeof PageHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Cars' },
};
