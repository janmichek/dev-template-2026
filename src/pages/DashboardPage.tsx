import { Flex, Spinner } from '@radix-ui/themes';
import Highcharts from 'highcharts';
import { HighchartsReact } from 'highcharts-react-official';
import { useState } from 'react';
import { CurrencySelect } from '../features/currencies';
import { totalValueSeries, useTransactions } from '../features/transactions';
import { PageHeading } from '../shared/ui';

export function DashboardPage() {
  const { data, isPending, error } = useTransactions();
  const [currency, setCurrency] = useState<string>();

  if (isPending)
    return (
      <Flex align="center" gap="2" role="status">
        <Spinner />
      </Flex>
    );
  if (error) return error.message;

  const visible = currency === undefined ? data : data.filter((tx) => tx.currency === currency);

  const options: Highcharts.Options = {
    title: { text: 'Total value in time' },
    xAxis: { type: 'datetime' },
    yAxis: { title: { text: 'USD' } },
    series: [{ type: 'area', name: 'Total value', data: totalValueSeries(visible) }],
  };

  return (
    <>
      <PageHeading>Dashboard</PageHeading>
      <Flex align="end" gap="3" mb="4">
        <CurrencySelect value={currency} onChange={setCurrency} />
      </Flex>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </>
  );
}
