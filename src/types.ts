import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  queryText: string;
  dataPath: string;
  groupBy: string;
  aliasBy: string;
  constant: number;
}

export const defaultQuery: Partial<MyQuery> = {
  queryText: `query {
      data:submissions(user:"$user"){
          Time:submitTime
          idle running completed
      }
}`,
  dataPath: 'data.data',
  groupBy: '', // `identifier`
  aliasBy: '', // 'Server [[tag_identifier]]`
  constant: 6.5,
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  apiKey?: string;
}
