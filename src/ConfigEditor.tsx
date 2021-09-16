import React, { ChangeEvent } from 'react';
import { DataSourceHttpSettings, InfoBox, InlineLabel, Input } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions } from './types';

export type Props = DataSourcePluginOptionsEditorProps<MyDataSourceOptions>;

export const ConfigEditor = (props: Props) => {
  const { options, onOptionsChange } = props;

  const onUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = props;
    const jsonData = {
      ...options.jsonData,
      websocketUrl: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  return (
    <>
      <DataSourceHttpSettings
        defaultUrl="http://localhost:9999"
        dataSourceConfig={options}
        onChange={onOptionsChange}
        showAccessOptions={true}
      />
      <div className="gf-form-group">
        <h3 className="page-heading">Websocket</h3>
        <div className="gf-form-inline">
          <InfoBox severity={'warning'} hidden={options.access === 'direct'}>
            Only available when using the <i>Browser</i> option.
          </InfoBox>
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <InlineLabel className="width-13">URL</InlineLabel>
            <Input
              css={''}
              disabled={options.access !== 'direct'}
              onChange={onUrlChange}
              className="width-20"
              placeholder="ws://localhost:9999"
            />
          </div>
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <div className="grafana-info-box">Websockets are used for GraphQL subscriptions</div>
          </div>
        </div>
      </div>
    </>
  );
};
