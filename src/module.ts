import { DataSourcePlugin } from '@grafana/ui';
import { DataSource, Options, Query } from './DataSource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';

export const plugin = new DataSourcePlugin<DataSource, Query, Options>(DataSource).setConfigEditor(ConfigEditor).setQueryEditor(QueryEditor);
