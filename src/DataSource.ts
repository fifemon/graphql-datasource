import defaults from 'lodash/defaults';

import { DataQueryRequest, DataQueryResponse, DataSourceApi, DataSourceInstanceSettings } from '@grafana/data';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';
import { dateTime, MutableDataFrame, FieldType, DataFrame } from '@grafana/data';
import _ from 'lodash';
import { flatten } from './util';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  basicAuth: string | undefined;
  withCredentials: boolean | undefined;
  url: string | undefined;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>, private backendSrv: any, private templateSrv: any) {
    super(instanceSettings);
    this.basicAuth = instanceSettings.basicAuth;
    this.withCredentials = instanceSettings.withCredentials;
    this.url = instanceSettings.url;
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

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    return Promise.all(
      options.targets.map(target => {
        let query = defaults(target, defaultQuery);
        let payload = query.queryText;
        if (options.range) {
          payload = payload.replace(/\$timeFrom/g, options.range.from.valueOf().toString());
          payload = payload.replace(/\$timeTo/g, options.range.to.valueOf().toString());
        }
        payload = this.templateSrv.replace(payload, options.scopedVars);
        //console.log(payload);
        return this.postQuery(query, payload);
      })
    ).then((results: any) => {
      const dataFrame: DataFrame[] = [];
      for (let res of results) {
        let data = res.query.dataPath.split('.').reduce((d: any, p: any) => {
          return d[p];
        }, res.results.data);
        const { groupBy } = res.query;
        const split = groupBy.split(',');
        const groupByList: string[] = [];
        for (const element of split) {
          const trimmed = element.trim();
          if (trimmed) {
            groupByList.push(trimmed);
          }
        }
        // array of each document [{"identifier": "server-1", "Time": 5000, "running": 6.6},{"identifier": "server-2", "Time": 5000, "running": 6.6}]
        const docs: any[] = [];
        const fieldIdentifierDocumentMap = new Map();
        const fieldIdentifierArray: string[][] = [];
        let pushDoc = (originalDoc: object) => {
          let flatDoc: any = flatten(originalDoc);
          console.log(flatDoc);
          const newDoc: any = {};
          for (const fieldName in flatDoc) {
            const identifiers: string[] = ['' + fieldName];

            if (fieldName !== 'Time') {
              for (const groupByElement of groupByList) {
                identifiers.push(flatDoc[groupByElement]);
              }
            }
            const identifiersString = identifiers.toString();

            newDoc[identifiersString] = flatDoc[fieldName];
            console.log('For ' + fieldName + ' id is ' + identifiersString);
            if (
              fieldIdentifierArray.findIndex(value => {
                return value.toString() === identifiersString;
              }) === -1
            ) {
              fieldIdentifierDocumentMap.set(identifiers, flatDoc);
              fieldIdentifierArray.push(identifiers);
            }
          }
          docs.push(newDoc);
        };
        if (Array.isArray(data)) {
          for (const element of data) {
            pushDoc(element);
          }
        } else {
          pushDoc(data);
        }

        let df = new MutableDataFrame({
          fields: [],
        });
        for (const fieldIdentifiers of fieldIdentifierArray) {
          const fieldName = fieldIdentifiers[0];
          const exampleDoc = fieldIdentifierDocumentMap.get(fieldIdentifiers);
          let t: FieldType = FieldType.string;
          if (fieldName === 'Time') {
            t = FieldType.time;
          } else if (_.isNumber(exampleDoc[fieldName])) {
            t = FieldType.number;
          }
          df.addField({
            name: fieldIdentifiers.toString(),
            type: t,
            config: { title: fieldIdentifiers.toString() }, // TODO use alias by here and use exampleDoc
          }).parse = (v: any) => {
            return v || '';
          };
        }
        for (const doc of docs) {
          if (doc.Time) {
            doc.Time = dateTime(doc.Time);
          }
          console.log('Going to add');
          console.log(doc);
          df.add(doc);
        }
        dataFrame.push(df);
      }
      return { data: dataFrame };
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
}
