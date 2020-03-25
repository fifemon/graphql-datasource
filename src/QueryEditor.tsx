import defaults from 'lodash/defaults';

import React, { PureComponent, ChangeEvent } from 'react';
import { QueryEditorProps, FormField } from '@grafana/ui';
import { DataSource } from './DataSource';
import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

interface State {}

export class QueryEditor extends PureComponent<Props, State> {
  onComponentDidMount() {}

  onQueryTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, queryText: event.target.value });
  };

  onDataPathTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, dataPath: event.target.value });
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { queryText, dataPath } = query;

    return (
      <>
        <textarea value={queryText || ''} onChange={this.onQueryTextChange} className="gf-form-input" rows={10} />
        <div className="gf-form">
          <FormField
            labelWidth={8}
            value={dataPath || ''}
            onChange={this.onDataPathTextChange}
            label="Data path"
            tooltip="dot-delimted path to data in response"
          ></FormField>
        </div>
      </>
    );
  }
}
