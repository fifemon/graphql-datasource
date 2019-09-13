import React, { PureComponent, ChangeEvent } from 'react';
import { FormField, QueryEditorProps } from '@grafana/ui';
import { DataSource, Query, Options } from './DataSource';

type Props = QueryEditorProps<DataSource, Query, Options>;

interface State {}

export class QueryEditor extends PureComponent<Props, State> {
  onComponentDidMount() {}

  onQueryTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, queryText: event.target.value });
  };

  render() {
    const { query } = this.props;
    const { queryText } = query;

    return (
      <div className="gf-form">
        <FormField width={24} value={queryText} onChange={this.onQueryTextChange} label="Query"></FormField>
      </div>
    );
  }
}
