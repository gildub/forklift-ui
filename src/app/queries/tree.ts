import * as React from 'react';
import { usePollingContext } from '@app/common/context';
import { QueryResult } from 'react-query';
import { getInventoryApiUrl, sortTreeItemsByName, useMockableQuery } from './helpers';
import { MOCK_RHV_HOST_TREE, MOCK_VMWARE_HOST_TREE, MOCK_VMWARE_VM_TREE } from './mocks/tree.mock';
import { SourceInventoryProvider } from './types';
import { InventoryTree, InventoryTreeType } from './types/tree.types';
import { useAuthorizedFetch } from './fetchHelpers';

export const useInventoryTreeQuery = <T extends InventoryTree>(
  provider: SourceInventoryProvider | null,
  treeType: InventoryTreeType
): QueryResult<T> => {
  // VMware providers have both Host and VM trees, but RHV only has Host trees.
  const isValidQuery = provider?.type === 'vsphere' || treeType === InventoryTreeType.Host;
  const apiSlug = treeType === InventoryTreeType.Host ? '/tree/host' : '/tree/vm';
  const result = useMockableQuery<T>(
    {
      queryKey: ['inventory-tree', provider?.name, treeType],
      queryFn: useAuthorizedFetch(getInventoryApiUrl(`${provider?.selfLink || ''}${apiSlug}`)),
      config: {
        enabled: isValidQuery && !!provider,
        refetchInterval: usePollingContext().refetchInterval,
      },
    },
    (treeType === InventoryTreeType.Host
      ? provider?.type === 'vsphere'
        ? MOCK_VMWARE_HOST_TREE
        : MOCK_RHV_HOST_TREE
      : MOCK_VMWARE_VM_TREE) as T
  );
  const sortedData = React.useMemo(() => sortTreeItemsByName(result.data), [result.data]);
  return {
    ...result,
    data: sortedData,
  };
};
