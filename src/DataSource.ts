import defaults from 'lodash/defaults';

import {
  AnnotationEvent,
  AnnotationQueryRequest,
  DataFrame,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  dateTime,
  FieldType,
  LoadingState,
  MetricFindValue,
  MutableDataFrame,
  ScopedVars,
  TimeRange,
} from '@grafana/data';

import {
  defaultQuery,
  MultiValueVariable,
  MyDataSourceOptions,
  MyQuery,
  MyVariableQuery,
  TextValuePair,
} from './types';
import { getTemplateSrv } from '@grafana/runtime';
import _, { isEqual } from 'lodash';
import { flatten, isRFC3339_ISO6801 } from './util';
import { merge, Observable } from 'rxjs';
import { ApolloClient, FetchResult, gql, InMemoryCache } from '@apollo/client';
import { split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';

import * as ZenObservable from 'zen-observable';

const supportedVariableTypes = ['constant', 'custom', 'query', 'textbox'];

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  basicAuth: string | undefined;
  withCredentials: boolean | undefined;
  url: string | undefined;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>, private backendSrv: any) {
    super(instanceSettings);
    this.basicAuth = instanceSettings.basicAuth;
    this.withCredentials = instanceSettings.withCredentials;
    this.url = instanceSettings.url?.replace(/(^\w+:|^)\/\//, '');
  }

  private request(data: string) {
    const options: any = {
      url: 'http://' + this.url,
      method: 'POST',
      data: {
        query: data,
      },
    };

    if (this.basicAuth || this.withCredentials) {
      options.withCredentials = true;
    }
    if (this.basicAuth) {
      options.headers = {
        Authorization: this.basicAuth,
      };
    }

    return this.backendSrv.datasourceRequest(options);
  }

  private postQuery(query: Partial<MyQuery>, payload: string) {
    return this.request(payload)
      .then((results: any) => {
        return { query, results };
      })
      .catch((err: any) => {
        if (err.data && err.data.error) {
          throw {
            message: 'GraphQL error: ' + err.data.error.reason,
            error: err.data.error,
          };
        }

        throw err;
      });
  }

  private static getDocs(resultsData: FetchResult<any>, dataPath: string): any[] {
    if (!resultsData) {
      throw 'resultsData was null or undefined';
    }
    let data = dataPath.split('.').reduce((d: any, p: any) => {
      if (!d) {
        return null;
      }
      return d[p];
    }, resultsData.data);
    if (!data) {
      if (resultsData.errors && resultsData.errors.length !== 0) {
        throw resultsData.errors[0];
      }
      throw 'Your data path did not exist! dataPath: ' + dataPath;
    }
    if (resultsData.errors) {
      // There can still be errors even if there is data
      console.log('Got GraphQL errors:');
      console.log(resultsData.errors);
    }
    const docs: any[] = [];
    let pushDoc = (originalDoc: object) => {
      docs.push(flatten(originalDoc));
    };
    if (Array.isArray(data)) {
      for (const element of data) {
        pushDoc(element);
      }
    } else {
      pushDoc(data);
    }
    return docs;
  }
  private static getDataPathArray(dataPathString: string): string[] {
    const dataPathArray: string[] = [];
    for (const dataPath of dataPathString.split(',')) {
      const trimmed = dataPath.trim();
      if (trimmed) {
        dataPathArray.push(trimmed);
      }
    }
    if (!dataPathArray) {
      throw 'data path is empty!';
    }
    return dataPathArray;
  }

  resultToDataQueryResponse(query: MyQuery, res: FetchResult<any>): DataQueryResponse {
    console.log(query);
    console.log(res);
    const dataFrameArray: DataFrame[] = [];

    const dataPathArray: string[] = DataSource.getDataPathArray(query.dataPath);
    const split = query.groupBy.split(',');
    const groupByList: string[] = [];
    for (const element of split) {
      const trimmed = element.trim();
      if (trimmed) {
        groupByList.push(trimmed);
      }
    }
    for (const dataPath of dataPathArray) {
      const docs: any[] = DataSource.getDocs(res, dataPath);

      const dataFrameMap = new Map<string, MutableDataFrame>();
      for (const doc of docs) {
        if (query.timePath in doc && query.timeFormat) {
          doc[query.timePath] = dateTime(doc[query.timePath], query.timeFormat);
        }
        const identifiers: string[] = [];
        for (const groupByElement of groupByList) {
          identifiers.push(doc[groupByElement]);
        }
        const identifiersString = identifiers.toString();
        let dataFrame = dataFrameMap.get(identifiersString);
        if (!dataFrame) {
          // we haven't initialized the dataFrame for this specific identifier that we group by yet
          dataFrame = new MutableDataFrame({ fields: [] });
          const generalReplaceObject: any = {};
          for (const fieldName in doc) {
            generalReplaceObject['field_' + fieldName] = doc[fieldName];
          }
          for (const fieldName in doc) {
            // ignore metadata fields
            if (fieldName.startsWith('__')) {
              continue;
            }
            let t: FieldType = FieldType.string;
            if (fieldName === query.timePath || isRFC3339_ISO6801(String(doc[fieldName]))) {
              t = FieldType.time;
            } else if (_.isNumber(doc[fieldName])) {
              t = FieldType.number;
            }
            let title;
            if (identifiers.length !== 0) {
              // if we have any identifiers
              title = identifiersString + '_' + fieldName;
            } else {
              title = fieldName;
            }
            if (query.aliasBy) {
              title = query.aliasBy;
              const replaceObject = { ...generalReplaceObject };
              replaceObject['fieldName'] = fieldName;
              for (const replaceKey in replaceObject) {
                const replaceValue = replaceObject[replaceKey];
                const regex = new RegExp('\\$' + replaceKey, 'g');
                title = title.replace(regex, replaceValue);
              }
              //title = getTemplateSrv().replace(title, query. options.scopedVars);
            }
            dataFrame.addField({
              name: fieldName,
              type: t,
              config: { displayName: title },
            }).parse = (v: any) => {
              return v || '';
            };
          }
          dataFrameMap.set(identifiersString, dataFrame);
        }

        dataFrame.add(doc);
      }
      for (const dataFrame of dataFrameMap.values()) {
        dataFrameArray.push(dataFrame);
      }
    }
    return {
      state: LoadingState.Done,
      data: dataFrameArray,
    };
  }

  private static createQuery(
    query: MyQuery,
    range: TimeRange | undefined,
    scopedVars: ScopedVars | undefined = undefined
  ): string {
    return getTemplateSrv().replace(query.queryText, {
      ...scopedVars,
      timeFrom: { text: 'from', value: range?.from.valueOf() },
      timeTo: { text: 'to', value: range?.to.valueOf() },
    });
  }

  private zenToRx<T>(zenObservable: ZenObservable<T>): Observable<T> {
    return new Observable((observer) => zenObservable.subscribe(observer));
  }

  query(options: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
    const httpLink = new HttpLink({
      uri: 'http://' + this.url,
    });

    const wsLink = new WebSocketLink({
      uri: 'ws://' + this.url,
      options: {
        reconnect: true,
      },
    });
    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
      },
      wsLink,
      httpLink
    );

    // Instantiate client
    const client = new ApolloClient({
      link: splitLink,
      cache: new InMemoryCache(),
    });
    const observables = options.targets.map((target) => {
      let query = defaults(target, defaultQuery);
      let payload = DataSource.createQuery(query, options.range, options.scopedVars);
      return this.zenToRx(
        client
          .subscribe({
            query: gql`
              ${payload}
            `,
          })
          .map((result) => this.resultToDataQueryResponse(query, result))
      );
    });
    return merge(...observables);
  }

  annotationQuery(options: AnnotationQueryRequest<MyQuery>): Promise<AnnotationEvent[]> {
    const query = defaults(options.annotation, defaultQuery);
    return Promise.all([DataSource.createQuery(query, options.range)]).then((results: any) => {
      const r: AnnotationEvent[] = [];
      for (const res of results) {
        const { timePath, endTimePath, timeFormat } = res.query;
        const dataPathArray: string[] = DataSource.getDataPathArray(res.query.dataPath);
        for (const dataPath of dataPathArray) {
          const docs: any[] = DataSource.getDocs(res.results.data, dataPath);
          for (const doc of docs) {
            const annotation: AnnotationEvent = {};
            if (timePath in doc) {
              annotation.time = dateTime(doc[timePath], timeFormat).valueOf();
            }
            if (endTimePath in doc) {
              annotation.isRegion = true;
              annotation.timeEnd = dateTime(doc[endTimePath], timeFormat).valueOf();
            }
            let title = query.annotationTitle;
            let text = query.annotationText;
            let tags = query.annotationTags;
            for (const fieldName in doc) {
              const fieldValue = doc[fieldName];
              const replaceKey = 'field_' + fieldName;
              const regex = new RegExp('\\$' + replaceKey, 'g');
              title = title.replace(regex, fieldValue);
              text = text.replace(regex, fieldValue);
              tags = tags.replace(regex, fieldValue);
            }

            annotation.title = title;
            annotation.text = text;
            const tagsList: string[] = [];
            for (const element of tags.split(',')) {
              const trimmed = element.trim();
              if (trimmed) {
                tagsList.push(trimmed);
              }
            }
            annotation.tags = tagsList;
            r.push(annotation);
          }
        }
      }
      return r;
    });
  }

  testDatasource() {
    const q = `{
      __schema{
        queryType{name}
      }
    }`;
    return this.postQuery(defaultQuery, q).then(
      (res: any) => {
        if (res.errors) {
          console.log(res.errors);
          return {
            status: 'error',
            message: 'GraphQL Error: ' + res.errors[0].message,
          };
        }
        return {
          status: 'success',
          message: 'Success',
        };
      },
      (err: any) => {
        console.log(err);
        return {
          status: 'error',
          message: 'HTTP Response ' + err.status + ': ' + err.statusText,
        };
      }
    );
  }

  async metricFindQuery(query: MyVariableQuery, options?: any) {
    const metricFindValues: MetricFindValue[] = [];

    query = defaults(query, defaultQuery);

    let payload = query.queryText;
    payload = getTemplateSrv().replace(payload, { ...this.getVariables });

    const response = await this.postQuery(query, payload);

    const docs: any[] = DataSource.getDocs(response.results.data, query.dataPath);

    for (const doc of docs) {
      if ('__text' in doc && '__value' in doc) {
        metricFindValues.push({ text: doc['__text'], value: doc['__value'] });
      } else {
        for (const fieldName in doc) {
          metricFindValues.push({ text: doc[fieldName] });
        }
      }
    }

    return metricFindValues;
  }

  getVariables() {
    const variables: { [id: string]: TextValuePair } = {};
    Object.values(getTemplateSrv().getVariables()).forEach((variable) => {
      if (!supportedVariableTypes.includes(variable.type)) {
        console.warn(`Variable of type "${variable.type}" is not supported`);

        return;
      }

      const supportedVariable = variable as MultiValueVariable;

      let variableValue = supportedVariable.current.value;
      if (variableValue === '$__all' || isEqual(variableValue, ['$__all'])) {
        if (supportedVariable.allValue === null || supportedVariable.allValue === '') {
          variableValue = supportedVariable.options.slice(1).map((textValuePair) => textValuePair.value);
        } else {
          variableValue = supportedVariable.allValue;
        }
      }

      variables[supportedVariable.id] = {
        text: supportedVariable.current.text,
        value: variableValue,
      };
    });

    return variables;
  }
}
