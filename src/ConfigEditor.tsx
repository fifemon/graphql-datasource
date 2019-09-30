import React, { PureComponent, ChangeEvent } from 'react';
import { DataSourcePluginOptionsEditorProps, DataSourceSettings, FormField } from '@grafana/ui';
import { MyDataSourceOptions } from './types';

type Settings = DataSourceSettings<MyDataSourceOptions>;

interface Props extends DataSourcePluginOptionsEditorProps<Settings> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  componentDidMount() {}

  onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      apiKey: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  render() {
    const { options } = this.props;
    const { jsonData } = options;

    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <FormField label="API Key" labelWidth={6} onChange={this.onAPIKeyChange} value={jsonData.apiKey || ''} placeholder="Your API key" />
        </div>
      </div>
    );
  }
}
