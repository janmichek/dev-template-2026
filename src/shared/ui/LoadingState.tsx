import { Flex, Spinner, Text } from '@radix-ui/themes';

export function LoadingState({ label }: { label?: string }) {
  return (
    <Flex align="center" gap="2" role="status">
      <Spinner />
      {label !== undefined && <Text>{label}</Text>}
    </Flex>
  );
}
