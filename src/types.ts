import { DataQuery, DataSourceJsonData, VariableModel } from '@grafana/data';

export interface MyQuery extends DataQuery {
  queryText: string;
  dataPath: string;
  groupBy: string;
  aliasBy: string;
  annotationTitle: string;
  annotationText: string;
  annotationTags: string;
  constant: number;
}

export const defaultQuery: Partial<MyQuery> = {
  queryText: `query {
      data:submissions(user:"$user"){
          Time:submitTime
          idle running completed
      }
}`,
  dataPath: 'data',
  groupBy: '', // `identifier`
  aliasBy: '', // 'Server [[tag_identifier]]`
  annotationTitle: '',
  annotationText: '',
  annotationTags: '',
  constant: 6.5,
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  apiKey?: string;
}

export interface MyVariableQuery extends DataQuery {
  dataPath: string;
  queryText: string;
}

export interface TextValuePair {
  text: string;
  value: any;
}

export interface MultiValueVariable extends VariableModel {
  allValue: string | null;
  id: string;
  current: TextValuePair;
  options: TextValuePair[];
}
