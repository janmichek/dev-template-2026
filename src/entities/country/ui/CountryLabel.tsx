import { Text } from '@radix-ui/themes';

export function CountryLabel({ flag, name }: { flag: string; name: string }) {
  return (
    <Text as="p" size="3" mt="3">
      {flag} {name}
    </Text>
  );
}
