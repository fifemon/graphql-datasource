import defaults from 'lodash/defaults';

import { DataQueryRequest, DataQueryResponse, DataSourceApi, DataSourceInstanceSettings } from '@grafana/ui';

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';
import { MutableDataFrame, FieldType, DataFrame } from '@grafana/data';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  basicAuth: string | undefined;
  withCredentials: boolean | undefined;
  url: string | undefined;

  constructor(
    instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>,
    private backendSrv: any,
    private templateSrv: any
  ) {
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
        "query": data,
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

  private postQuery(query: string) {
    return this.request(query)
    .then((results: any) => {
      return results.data;
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
    const dataFrame: DataFrame[] = [];
    //const data = options.targets.map(target => {
    const query = defaults(options.targets[0], defaultQuery);
    let payload = query.queryText;
    payload = payload.replace(/\$timeFrom/g, options.range.from.valueOf().toString());
    payload = payload.replace(/\$timeTo/g, options.range.to.valueOf().toString());
    payload = this.templateSrv.replace(payload, options.scopedVars);
    console.log(payload);

    return this.postQuery(payload).then((results: any) => {
      console.log(results);
      let data = results.data.data;
      const docs: any[] = [];
      let fields: any[] = [];
      for (let i = 0; i < data.length; i++) {
        console.log(data[i]);
        for (let p in data[i]) {
          if (fields.indexOf(p) === -1) {
            fields.push(p);
          }
        }
        docs.push(data[i]);
      }

      console.log(docs);
      console.log(fields);
      let df = new MutableDataFrame({
        refId: query.refId,
        fields: [],
        //fields: [
        //  { name: 'Time', values: [from, to], type: FieldType.time },
        //  { name: 'Value', values: [query.constant, query.constant], type: FieldType.number },
        //  { name: 'Value2', values: [query.constant * 2, query.constant * 2], type: FieldType.number },
        //],
      });
      for (const f of fields) {
        df.addField({
          name: f,
          type: FieldType.string,
        }).parse = (v: any) => {
          return v || '';
        };
      }
      for (const doc of docs) {
        df.add(doc);
      }
      dataFrame.push(df);
      return { data: dataFrame };
    });
  }

  testDatasource() {
    // Implement a health check for your data source.

    return new Promise((resolve, reject) => {
      resolve({
        status: 'success',
        message: 'Success',
      });
    });
  }
}
