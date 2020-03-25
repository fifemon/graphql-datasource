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
        const docs: any[] = [];
        const fields: any[] = [];
        let pushDoc = (doc: object) => {
          let d = flatten(doc);
          for (let p in d) {
            if (fields.indexOf(p) === -1) {
              fields.push(p);
            }
          }
          docs.push(d);
        };
        if (Array.isArray(data)) {
          for (let i = 0; i < data.length; i++) {
            pushDoc(data[i]);
          }
        } else {
          pushDoc(data);
        }

        let df = new MutableDataFrame({
          fields: [],
        });
        for (const f of fields) {
          let t: FieldType = FieldType.string;
          if (f === 'Time') {
            t = FieldType.time;
          } else if (_.isNumber(docs[0][f])) {
            t = FieldType.number;
          }
          df.addField({
            name: f,
            type: t,
          }).parse = (v: any) => {
            return v || '';
          };
        }
        for (const doc of docs) {
          if (doc.Time) {
            doc.Time = dateTime(doc.Time);
          }
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
