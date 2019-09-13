import { DataQueryRequest, DataQueryResponse, DataSourceApi, DataSourceInstanceSettings, DataQuery, DataSourceJsonData } from '@grafana/ui';

export interface Query extends DataQuery {
  queryText?: string;
}

export interface Options extends DataSourceJsonData {
  apiKey?: string;
}

interface Request {
  queries: any[];
  from?: string;
  to?: string;
}

export class DataSource extends DataSourceApi<Query, Options> {
  constructor(instanceSettings: DataSourceInstanceSettings<Options>) {
    super(instanceSettings);
  }

  query(options: DataQueryRequest<Query>): Promise<DataQueryResponse> {
    const requestData: Request = {
      queries: options.targets.map((target: any) => {
        return {
          datasourceId: this.id,
          refId: target.refId,
          queryText: target.queryText,
        };
      }),
    };

    if (options.range) {
      requestData.from = options.range.from.valueOf().toString();
      requestData.to = options.range.to.valueOf().toString();
    }

    // This is where you will call your data source.

    return Promise.resolve({ data: [] });
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
