import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { Icon, LegacyForms } from '@grafana/ui';
import { DataSource } from './DataSource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';
import { DocumentNode } from 'graphql';
import GraphiQL from 'graphiql';
import { Fetcher } from 'graphiql/dist/components/GraphiQL';
import './graphiql_modified.css';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

interface State {}

export class QueryEditor extends PureComponent<Props, State> {
  onComponentDidMount() {}

  onChangeQuery = (value?: string, documentAST?: DocumentNode) => {
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
    const query = defaults(this.props.query, defaultQuery);
    const { queryText, dataPath, timePath, timeFormat, groupBy, aliasBy } = query;
    // Good info about GraphiQL here: https://www.npmjs.com/package/graphiql
    const datasource = this.props.datasource;
    // TODO We might want to include some basic auth stuff in the CreateFetcherOptions since DataSource has the basicAuth property
    const fetcher: Fetcher = async (graphQLParams) => {
      const data = await fetch(datasource.url || '', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphQLParams),
        credentials: 'same-origin',
      });
      return data.json().catch(() => data.text());
    };
    return (
      <>
        {/*<link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />*/}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.23.0/theme/dracula.css" />
        <div
          style={{
            height: '50vh',
          }}
        >
          <GraphiQL
            query={queryText || ''}
            fetcher={fetcher}
            editorTheme={'dracula'}
            onEditQuery={this.onChangeQuery}
          />
        </div>
        <div className="gf-form">
          <LegacyForms.FormField
            labelWidth={8}
            inputWidth={24}
            value={dataPath || ''}
            onChange={this.onDataPathTextChange}
            label="Data path"
            tooltip="dot-delimited path to data in response. Separate with commas to use multiple data paths"
          />
        </div>
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
        <div className={'gf-form'}>
          <LegacyForms.FormField
            labelWidth={8}
            inputWidth={24}
            value={timeFormat || ''}
            onChange={this.onTimeFormatTextChange}
            label="Time format"
            tooltip={
              <a href="https://momentjs.com/docs/#/parsing/string-format/" title="Formatting help">
                Optional time format in moment.js format.&nbsp;
                <Icon name="external-link-alt" />
              </a>
            }
          />
        </div>
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
