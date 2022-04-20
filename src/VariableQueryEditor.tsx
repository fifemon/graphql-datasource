import React, { PureComponent } from 'react';
import { MyDataSourceOptions, MyQuery } from './types';
import { createGraphiQL } from './GraphiQLUtil';
import { DataSource } from './DataSource';
import { QueryEditorProps } from '@grafana/data';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;
interface State {
  dataPath?: string;
}

export class VariableQueryEditor extends PureComponent<Props, State> {
  graphiQLElement: JSX.Element;

  constructor(props: Props) {
    super(props);
    this.graphiQLElement = createGraphiQL(this.props.datasource, this.props.query.queryText, this.onChangeQuery);
  }
  onChangeQuery = (value?: string) => {
    const { onChange, query } = this.props;
    if (onChange && value !== undefined) {
      onChange({
        ...query,
        // we shouldn't need to include ...this.state here because its changes should have already made it into query
        queryText: value,
      });
    }
  };
  saveState = () => {
    // We don't use the state for queryText since createGraphiQL handles that
    const { onChange, query } = this.props;
    onChange({
      ...query,
      ...(this.state ?? {}),
    });
  };
  // Right now this is only used for dataPath, so [event.currentTarget.name] should always be dataPath
  handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      ...(this.state ?? {}),
      [event.currentTarget.name]: event.currentTarget.value,
    });
  };

  render() {
    const graphiQL = this.graphiQLElement;
    return (
      <>
        <div className="gf-form">
          <span className="gf-form-label width-10">Data Path</span>
          <input
            name="dataPath"
            className="gf-form-input"
            onBlur={this.saveState}
            onChange={this.handleChange}
            value={this.state?.dataPath ?? this.props.query.dataPath}
          />
        </div>
        <div
          style={{
            height: '50vh',
          }}
        >
          {graphiQL}
        </div>
      </>
    );
  }
}
