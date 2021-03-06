import { usePollingContext } from '@app/common/context';
import { QueryResult } from 'react-query';
import { getInventoryApiUrl, useResultsSortedByName, useMockableQuery } from './helpers';
import { IOpenShiftProvider } from './types';
import { useAuthorizedFetch } from './fetchHelpers';
import { IOpenShiftNamespace } from './types/namespaces.types';
import { MOCK_OPENSHIFT_NAMESPACES } from './mocks/namespaces.mock';

export const useNamespacesQuery = (
  provider: IOpenShiftProvider | null
): QueryResult<IOpenShiftNamespace[]> => {
  const result = useMockableQuery<IOpenShiftNamespace[]>(
    {
      queryKey: ['namespaces', provider?.name],
      queryFn: useAuthorizedFetch(getInventoryApiUrl(`${provider?.selfLink || ''}/namespaces`)),
      config: {
        enabled: !!provider,
        refetchInterval: usePollingContext().refetchInterval,
      },
    },
    MOCK_OPENSHIFT_NAMESPACES
  );
  return useResultsSortedByName(result);
};
