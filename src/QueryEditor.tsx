import defaults from 'lodash/defaults';

import React, { PureComponent, ChangeEvent } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { FormField } from '@grafana/ui';
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
  onGroupByTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, groupBy: event.target.value });
  };

  onAliasByTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, aliasBy: event.target.value });
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { queryText, dataPath, groupBy, aliasBy } = query;

    return (
      <>
        <textarea value={queryText || ''} onChange={this.onQueryTextChange} className="gf-form-input" rows={10} />
        <div className="gf-form">
          <FormField
            labelWidth={8}
            value={dataPath || ''}
            onChange={this.onDataPathTextChange}
            label="Data path"
            tooltip="dot-delimited path to data in response"
          />
        </div>
        <div className={'gf-form'}>
          <FormField
            labelWidth={8}
            value={groupBy || ''}
            onChange={this.onGroupByTextChange}
            label="Group by"
            tooltip="dot-delimited path for the key to use. Separate with commas to use multiple fields to group by"
          />
        </div>
        <div className={'gf-form'}>
          <FormField
            labelWidth={8}
            value={aliasBy || ''}
            onChange={this.onAliasByTextChange}
            label="Alias by"
            tooltip="The formattable text to alias by. Use $field_<field name> to replace with the value of a field, or $fieldName to replace with the name of the field"
          />
        </div>
      </>
    );
  }
}
