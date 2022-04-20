import { DataQuery, DataSourceJsonData, VariableModel } from '@grafana/data';

export interface CommonQuery extends DataQuery {
  queryText: string;
  dataPath: string;
}

interface LegacyQueryOptions {
  endTimePath?: string | null;
  annotationTitle?: string;
  annotationText?: string;
  annotationTags?: string;
  /** This field should not be used. In legacy configurations, this is always 6.5*/
  constant?: number;
}
interface TimedQuery extends CommonQuery {
  timeFormat: string | null;
}

export interface MyMainQuery extends TimedQuery {
  timePath: string;
  groupBy: string;
  aliasBy: string;
}

export interface MyVariableQuery extends CommonQuery {}

export interface MyAnnotationQuery extends TimedQuery {
  /** Comma-delimited list of time paths, where each time path is dot-delimited*/
  timePaths: string;
  additionalTexts: Record<string, string>;
}

// export interface MyQuery extends MyMainQuery, MyVariableQuery, MyAnnotationQuery, LegacyQueryOptions {
// }
export type MyQuery = (MyMainQuery | MyVariableQuery | MyAnnotationQuery) &
  Partial<MyMainQuery> &
  Partial<MyVariableQuery> &
  Partial<MyAnnotationQuery> &
  Partial<LegacyQueryOptions>;

export const defaultCommonQuery: Partial<CommonQuery> = {
  queryText: `{
  data:submissions(user:"$user"){
    Time:submitTime
    idle
    running
    completed
  }
}`,
  dataPath: 'data',
};
const defaultTimedQuery: Partial<TimedQuery> = {
  ...defaultCommonQuery,
  timeFormat: null,
};

export const defaultMainQuery: Partial<MyMainQuery> = {
  ...defaultTimedQuery,
  timePath: 'Time',
  groupBy: '', // `identifier`
  aliasBy: '', // 'Server [[tag_identifier]]`
};

/** Should not be used except for legacy field defaults. */
export const defaultMixedQuery: Partial<MyQuery> = {
  queryText: defaultMainQuery.queryText,
  dataPath: defaultMainQuery.dataPath,
  timePath: defaultMainQuery.timePath,
  endTimePath: 'endTime',
  timeFormat: null,
  groupBy: defaultMainQuery.groupBy,
  aliasBy: defaultMainQuery.aliasBy,
  annotationTitle: '',
  annotationText: '',
  annotationTags: '',
  constant: 6.5,
};
export const defaultAnnotationQuery: Partial<MyAnnotationQuery> = {
  ...defaultTimedQuery,
  timePaths: 'Time, endTime',
  additionalTexts: {},
};
export const defaultVariableQuery: Partial<MyVariableQuery> = {
  ...defaultCommonQuery,
};

/**
 * These are options configured for each DataSource instance
 */
export interface MyDataSourceOptions extends DataSourceJsonData {
  apiKey?: string;
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
