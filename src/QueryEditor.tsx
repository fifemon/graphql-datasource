import defaults from 'lodash/defaults';

import React, { PureComponent, ChangeEvent } from 'react';
import { FormField, QueryEditorProps } from '@grafana/ui';
import { DataSource } from './DataSource';
import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

interface State {}

export class QueryEditor extends PureComponent<Props, State> {
  onComponentDidMount() {}

  onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, queryText: event.target.value });
  };

  onConstantChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, constant: parseFloat(event.target.value) });
    onRunQuery(); // executes the query
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { queryText, constant } = query;

    return (
      <div className="gf-form">
        <FormField width={4} value={constant} onChange={this.onConstantChange} label="Constant" type="number" step="0.1"></FormField>
        <FormField labelWidth={8} value={queryText || ''} onChange={this.onQueryTextChange} label="Query Text" tooltip="Not used yet"></FormField>
      </div>
    );
  }
}
