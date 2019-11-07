import defaults from 'lodash/defaults';

import React, { PureComponent, ChangeEvent } from 'react';
import { QueryEditorProps } from '@grafana/ui';
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

  onConstantChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, constant: parseFloat(event.target.value) });
    onRunQuery(); // executes the query
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { queryText} = query;

    return (
      <>
      <textarea value={queryText || ''} onChange={this.onQueryTextChange} className="gf-form-input" rows={10} />
      </>
    );
  }
}
