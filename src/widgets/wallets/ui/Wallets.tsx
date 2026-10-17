import { Flex, Text } from '@radix-ui/themes';
import { WalletName } from '../../../entities/wallet';
import { useTransactions } from '../../../features/list-transactions';
import { LoadingState } from '../../../shared/ui';

const shown = 4;

export function Wallets({ currency }: { currency: string | undefined }) {
  const { data = [], isPending, error } = useTransactions();
  if (isPending || error) return error ? error.message : <LoadingState label="Wallets..." />;

  const names = new Set<string>();
  for (const tx of data) {
    if (currency !== undefined && tx.currency !== currency) continue;
    names.add(tx.from);
    names.add(tx.to);
    if (names.size >= shown) break;
  }

  return (
    <Flex direction="column" gap="1" mb="4">
      <Text size="2" color="gray">
        Wallets
      </Text>
      {[...names].map((name) => (
        <WalletName key={name} name={name} />
      ))}
    </Flex>
  );
}
