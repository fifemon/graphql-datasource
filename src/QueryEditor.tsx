import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { LegacyForms } from '@grafana/ui';
import { DataSource } from './DataSource';
import {defaultMainQuery, MyDataSourceOptions, MyMainQuery, MyQuery} from './types';
import './graphiql_modified.css';
import { createGraphiQL } from './GraphiQLUtil';
import {createDataPathForm, createTimeFormatForm} from "./QueryEditorUtil";

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

interface State {}

export class QueryEditor extends PureComponent<Props, State> {
  onComponentDidMount() {}

  onChangeQuery = (value?: string) => {
    // any should be replaced with DocumentNode
    const { onChange, query } = this.props;
    if (onChange && value !== undefined) {
      onChange({ ...query, queryText: value });
    }
  };

  onDataPathTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, dataPath: event.target.value });
  };
  onTimePathTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, timePath: event.target.value });
  };
  onTimeFormatTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, timeFormat: event.target.value });
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
    const query: MyMainQuery = defaults(this.props.query, defaultMainQuery) as MyMainQuery;
    const { queryText, dataPath, timePath, timeFormat, groupBy, aliasBy } = query;
    // Good info about GraphiQL here: https://www.npmjs.com/package/graphiql
    const graphiQL = createGraphiQL(this.props.datasource, queryText, this.onChangeQuery);
    return (
      <>
        {/*<link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />*/}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.23.0/theme/dracula.css" />
        <div
          style={{
            height: '50vh',
          }}
        >
          {graphiQL}
        </div>
        {createDataPathForm(dataPath || '', this.onDataPathTextChange)}
        <div className="gf-form">
          <LegacyForms.FormField
            labelWidth={8}
            inputWidth={24}
            value={timePath || ''}
            onChange={this.onTimePathTextChange}
            label="Time path"
            tooltip="dot-delimited path to time under data path"
          />
        </div>
        {createTimeFormatForm(timeFormat || '', this.onTimeFormatTextChange)}
        <div className={'gf-form'}>
          <LegacyForms.FormField
            labelWidth={8}
            inputWidth={24}
            value={groupBy || ''}
            onChange={this.onGroupByTextChange}
            label="Group by"
            tooltip="dot-delimited path for the key to use. Separate with commas to use multiple fields to group by"
          />
        </div>
        <div className={'gf-form'}>
          <LegacyForms.FormField
            labelWidth={8}
            inputWidth={24}
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
