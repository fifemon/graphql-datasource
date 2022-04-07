import defaults from 'lodash/defaults';

import React, {ChangeEvent, PureComponent} from 'react';
import {QueryEditorProps} from '@grafana/data';
import {DataSource} from './DataSource';
import {defaultAnnotationQuery, MyAnnotationQuery, MyDataSourceOptions, MyQuery} from './types';
import './graphiql_modified.css';
import {createGraphiQL} from './GraphiQLUtil';
import {createDataPathForm, createTimeFormatForm} from "./QueryEditorUtil";
import {LegacyForms} from "@grafana/ui";

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

interface State {}

export class AnnotationQueryEditor extends PureComponent<Props, State> {

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
  onTimePathsTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    const timePathString = event.target.value;
    onChange({ ...query, timePaths: AnnotationQueryEditor.timePathsToArray(timePathString) });
  };
  onTimeFormatTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, timeFormat: event.target.value });
  };

  private static timePathsToString(timePaths: string[]): string {
    return timePaths.join(",");
  }
  private static timePathsToArray(timePaths: string): string[] {
    const r = [];
    for (const timePath in timePaths.split(",")) {
      const trimmed = timePath.trim();
      if (trimmed) {
        r.push(trimmed);
      }
    }
    return r;
  }

  render() {
    const query: MyAnnotationQuery = defaults(this.props.query, defaultAnnotationQuery) as MyAnnotationQuery;
    const { queryText, dataPath, timeFormat, timePaths } = query;
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
            value={AnnotationQueryEditor.timePathsToString(timePaths)}
            onChange={this.onTimePathsTextChange}
            label="Time paths"
            tooltip="Comma separated list of paths to each field to be treated as a timestamp. Each path is dot-delimited to time under data path"
          />
        </div>
        {createTimeFormatForm(timeFormat || '', this.onTimeFormatTextChange)}
      </>
    );
  }
}
