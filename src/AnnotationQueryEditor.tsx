import defaults from 'lodash/defaults';

import React, { ChangeEvent, PureComponent } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './DataSource';
import { defaultAnnotationQuery, MyAnnotationQuery, MyDataSourceOptions, MyQuery } from './types';
import './graphiql_modified.css';
import { createGraphiQL } from './GraphiQLUtil';
import { createDataPathForm, createTimeFormatForm } from './QueryEditorUtil';
import { InlineLabel, LegacyForms } from '@grafana/ui';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

interface State {
  newAdditionalTextFieldName?: string;
}

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
    onChange({ ...query, timePaths: event.target.value });
  };
  onTimeFormatTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query } = this.props;
    onChange({ ...query, timeFormat: event.target.value });
  };
  removeAdditionalText = (fieldName: string) => {
    const { onChange, query } = this.props;
    const additionalTexts = { ...query.additionalTexts };
    delete additionalTexts[fieldName];
    onChange({
      ...query,
      additionalTexts: additionalTexts,
    });
  };
  addNewAdditionalText = (fieldName: string) => {
    this.setAdditionalText(fieldName, '');
  };
  setAdditionalText = (fieldName: string, value: string) => {
    const { onChange, query } = this.props;
    onChange({
      ...query,
      additionalTexts: {
        ...query.additionalTexts,
        [fieldName]: value,
      },
    });
  };
  graphiQLElement: JSX.Element | null = null;

  render() {
    const query: MyAnnotationQuery = defaults(this.props.query, defaultAnnotationQuery) as MyAnnotationQuery;
    const { queryText, dataPath, timeFormat, timePaths, additionalTexts } = query;
    if (this.graphiQLElement === null) {
      // render() gets called a lot. We only need to create the graphiQL element once so this can help eliminate needless reloads
      this.graphiQLElement = createGraphiQL(this.props.datasource, queryText, this.onChangeQuery);
    }
    const graphiQL = this.graphiQLElement;

    const additionalTextElements: JSX.Element[] = [];
    for (const additionalFieldName in additionalTexts) {
      const value = additionalTexts[additionalFieldName];
      additionalTextElements.push(
        <>
          <div className="gf-form">
            <LegacyForms.FormField
              labelWidth={8}
              inputWidth={24}
              value={value}
              onChange={(event) => {
                this.setAdditionalText(additionalFieldName, event.target.value);
              }}
              label={additionalFieldName}
              tooltip="This is a custom field. Use $field_<field name> to replace with the value of another field."
            />
            <InlineLabel
              as="button"
              style={{ width: '2em' }}
              onClick={() => {
                this.removeAdditionalText(additionalFieldName);
              }}
            >
              -
            </InlineLabel>
          </div>
        </>
      );
    }

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
            value={timePaths}
            onChange={this.onTimePathsTextChange}
            label="Time paths"
            tooltip="Comma separated list of paths to each field to be treated as a timestamp. Each path is dot-delimited to time under data path"
          />
        </div>
        {createTimeFormatForm(timeFormat || '', this.onTimeFormatTextChange)}
        <div>
          <div className="gf-form">
            <LegacyForms.FormField
              labelWidth={8}
              inputWidth={24}
              value={this.state?.newAdditionalTextFieldName ?? ''}
              onChange={(event) => {
                this.setState({
                  ...(this.state ?? {}),
                  newAdditionalTextFieldName: event.target.value,
                });
              }}
              label="Add additional field"
            />
            <InlineLabel
              as="button"
              style={{ width: '2em' }}
              onClick={() => {
                const fieldName = this.state?.newAdditionalTextFieldName?.trim();
                if (fieldName) {
                  this.addNewAdditionalText(fieldName);
                }
                this.setState({
                  ...(this.state ?? {}),
                  newAdditionalTextFieldName: '',
                });
              }}
            >
              +
            </InlineLabel>
          </div>
          {additionalTextElements}
        </div>
      </>
    );
  }
}
