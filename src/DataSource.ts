import defaults from 'lodash/defaults';

import {
  AnnotationEventFieldSource,
  AnnotationEventMappings,
  AnnotationQuery,
  DataFrame,
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  dateTime,
  FieldType,
  MetricFindValue,
  MutableDataFrame,
  ScopedVars,
  TimeRange,
} from '@grafana/data';

import {
  CommonQuery, defaultAnnotationQuery, defaultCommonQuery, defaultMainQuery, defaultVariableQuery,
  MultiValueVariable,
  MyDataSourceOptions,
  MyQuery,
  MyVariableQuery,
  TextValuePair,
} from './types';
import {getTemplateSrv} from '@grafana/runtime';
import _, {escapeRegExp} from 'lodash';
import {flatten, isRFC3339_ISO6801} from './util';
import {AnnotationQueryEditor} from "./AnnotationQueryEditor";

const supportedVariableTypes = ['constant', 'custom', 'query', 'textbox'];

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  basicAuth: string | undefined;
  withCredentials: boolean | undefined;
  url: string | undefined;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>, private backendSrv: any) {
    super(instanceSettings);
    this.basicAuth = instanceSettings.basicAuth;
    this.withCredentials = instanceSettings.withCredentials;
    this.url = instanceSettings.url;
    this.annotations = {
      prepareAnnotation(json: any): AnnotationQuery<MyQuery> {
        console.log("preparing JSON");
        console.log(json);
        if ("target" in json) { // New format
          return json;
        }
        const mappings: AnnotationEventMappings = {
          time: {
            source: AnnotationEventFieldSource.Field,
            value: json.timePath ?? defaultMainQuery.timePath
          }
        };
        const additionalTexts: Record<string, string> = {};
        if (json.endTimePath) {
          mappings.timeEnd = {
            source: AnnotationEventFieldSource.Field,
            value: json.endTimePath
          }
        }
        if (json.annotationTags) {
          additionalTexts["extra.tags"] = json.annotationTags;
          mappings.tags = {
            source: AnnotationEventFieldSource.Field,
            value: "extra.tags"
          }
        }
        if (json.annotationText) {
          additionalTexts["extra.text"] = json.annotationText;
          mappings.text = {
            source: AnnotationEventFieldSource.Field,
            value: "extra.text"
          }
        }
        if (json.annotationTitle) {
          additionalTexts["extra.title"] = json.annotationTitle;
          mappings.title = {
            source: AnnotationEventFieldSource.Field,
            value: "extra.title"
          }
        }
        const timePaths = [json.timePath ?? defaultMainQuery.timePath];
        if (json.endTimePath) {
          timePaths.push(json.endTimePath);
        }
        // This is the old legacy format, so let's transform it to avoid breaking users' existing queries
        return {
          datasource: json.datasource,
          enable: json.enable,
          iconColor: json.iconColor,
          name: json.name,
          mappings: mappings,
          target: {
            refId: "Anno",
            queryText: json.queryText,
            dataPath: json.dataPath,
            timePaths: timePaths,
            timeFormat: json.timeFormat ?? defaultAnnotationQuery.timeFormat, // very old configurations may not have timeFormat defined
            additionalTexts: additionalTexts,
          }
        };
      },
      QueryEditor: AnnotationQueryEditor,
    };
  }

  private request(data: string) {
    const options: any = {
      url: this.url,
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

  private postQuery(query: Partial<CommonQuery>, payload: string) {
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

  private createQuery(query: CommonQuery, range: TimeRange | undefined, scopedVars: ScopedVars | undefined = undefined) {
    let payload = getTemplateSrv().replace(query.queryText, {
      ...scopedVars,
      timeFrom: { text: 'from', value: range?.from.valueOf() },
      timeTo: { text: 'to', value: range?.to.valueOf() },
    });

    //console.log(payload);
    return this.postQuery(query, payload);
  }
  private static getDocs(resultsData: any, dataPath: string): any[] {
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
      const errors: any[] = resultsData.errors;
      if (errors && errors.length !== 0) {
        throw errors[0];
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

  private static substituteString(text: string, scopedVars: ScopedVars, replaceObject: any = {}): string {
    let result = text;
    for (const replaceKey in replaceObject) {
      const replaceValue = replaceObject[replaceKey];

      const regex = new RegExp(escapeRegExp("$" + replaceKey), 'g');
      result = result.replace(regex, replaceValue);
    }
    return getTemplateSrv().replace(result, scopedVars);
  }

  private static getDisplayName(options: DataQueryRequest<MyQuery>, fieldName: string, identifiers: string[], identifiersString: string, generalReplaceObject: any, aliasBy?: string): string {
    if (aliasBy) {
      const replaceObject = { ...generalReplaceObject };
      replaceObject['fieldName'] = fieldName;
      return this.substituteString(aliasBy, options.scopedVars, replaceObject);
    }
    if (identifiers.length !== 0) {
      // if we have any identifiers
      return identifiersString + '_' + fieldName;
    }
    return fieldName;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    return Promise.all(
      options.targets.map((target) => {
        return this.createQuery(defaults(target, defaultCommonQuery), options.range, options.scopedVars);
      })
    ).then((results) => {
      const dataFrameArray: DataFrame[] = [];
      for (let res of results) {
        const dataPathArray: string[] = DataSource.getDataPathArray(res.query.dataPath);
        const query: MyQuery = res.query;
        const { timePath, endTimePath, timePaths, timeFormat, groupBy, aliasBy, additionalTexts } = query; // any of these variables may be undefined
        const allTimePaths = timePaths === undefined ? [] : [...timePaths];
        if (timePath) {
          allTimePaths.push(timePath);
        }
        if (endTimePath) {
          allTimePaths.push(endTimePath);
        }
        const split = groupBy === undefined ? [] : groupBy.split(',');
        const groupByList: string[] = [];
        for (const element of split) {
          const trimmed = element.trim();
          if (trimmed) {
            groupByList.push(trimmed);
          }
        }
        for (const dataPath of dataPathArray) {
          const docs: any[] = DataSource.getDocs(res.results.data, dataPath);

          const dataFrameMap = new Map<string, MutableDataFrame>();
          for (const doc of docs) {
            if (timePath !== undefined && timePath in doc) {
              // If timePath is in doc, then timePath !== undefined, which means timeFormat !== undefined too
              doc[timePath] = dateTime(doc[timePath], timeFormat as string);
            }
            const identifiers: string[] = [];
            for (const groupByElement of groupByList) {
              identifiers.push(doc[groupByElement]);
            }
            const identifiersString = identifiers.toString();
            const generalReplaceObject: Record<string, any> = {};
            for (const fieldName in doc) {
              generalReplaceObject['field_' + fieldName] = doc[fieldName];
            }
            let dataFrame = dataFrameMap.get(identifiersString);
            if (!dataFrame) {
              // we haven't initialized the dataFrame for this specific identifier that we group by yet
              dataFrame = new MutableDataFrame({ fields: [] });
              for (const fieldName in doc) {
                let t: FieldType = FieldType.string;
                if (fieldName in allTimePaths || isRFC3339_ISO6801(String(doc[fieldName]))) {
                  t = FieldType.time;
                } else if (_.isNumber(doc[fieldName])) {
                  t = FieldType.number;
                }
                const title = DataSource.getDisplayName(options, fieldName, identifiers, identifiersString, generalReplaceObject, aliasBy);
                dataFrame.addField({
                  name: fieldName,
                  type: t,
                  config: { displayName: title },
                }).parse = (v: any) => {
                  return v || '';
                };
              }
              for (const additionalFieldName in additionalTexts) {
                // Note that although aliasBy should be undefined, we will get getDisplayName anyway for consistency.
                dataFrame.addField({
                  name: additionalFieldName,
                  type: FieldType.string,
                  config: { displayName: DataSource.getDisplayName(options, additionalFieldName, identifiers, identifiersString, generalReplaceObject, aliasBy) }
                })
              }

              dataFrameMap.set(identifiersString, dataFrame);
            }

            const finalDoc = { ...doc };
            for (const additionalFieldName in additionalTexts) {
              const additionalText = additionalTexts[additionalFieldName];
              finalDoc[additionalFieldName] = DataSource.substituteString(additionalText, options.scopedVars, generalReplaceObject);
            }

            dataFrame.add(finalDoc);
          }
          for (const dataFrame of dataFrameMap.values()) {
            dataFrameArray.push(dataFrame);
          }
        }
      }
      return { data: dataFrameArray };
    });
  }

  testDatasource() {
    const q = `{
      __schema{
        queryType{name}
      }
    }`;
    return this.postQuery(defaultCommonQuery, q).then(
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

    query = defaults(query, defaultVariableQuery);

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
      if (variableValue === '$__all' || _.isEqual(variableValue, ['$__all'])) {
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
