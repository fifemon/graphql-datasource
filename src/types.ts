import { DataQuery, DataSourceJsonData } from '@grafana/ui';

export interface MyQuery extends DataQuery {
  queryText: string;
  dataPath: string;
  constant: number;
}

export const defaultQuery: Partial<MyQuery> = {
  queryText: `{
    submissions(user:"novapro"){
    id
    pomsTaskID
    done
    command
    idle running completed held
    submitTime
    error
    }
    }`,
  dataPath: 'data.submissions',
  constant: 6.5,
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  apiKey?: string;
}
