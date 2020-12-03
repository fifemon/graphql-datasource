import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './DataSource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { MyQuery, MyDataSourceOptions } from './types';
import { GraphQLAnnotationsQueryCtrl } from './GraphQLAnnotationsQueryCtrl';
import { VariableQueryEditor } from './VariableQueryEditor';

export const plugin = new DataSourcePlugin<DataSource, MyQuery, MyDataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setAnnotationQueryCtrl(GraphQLAnnotationsQueryCtrl)
  .setQueryEditor(QueryEditor)
  .setVariableQueryEditor(VariableQueryEditor);
