import defaults from 'lodash/defaults';

import React, { PureComponent, ChangeEvent } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { LegacyForms, QueryField, Icon } from '@grafana/ui';
import { DataSource } from './DataSource';
import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

interface State {}

export class QueryEditor extends PureComponent<Props, State> {
  onComponentDidMount() {}

  onChangeQuery = (value: string, override?: boolean) => {
    const { onChange, query } = this.props;
    if (onChange) {
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

    return (
      <>
        <QueryField query={queryText || ''} onChange={this.onChangeQuery} portalOrigin="graphQL" />
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
