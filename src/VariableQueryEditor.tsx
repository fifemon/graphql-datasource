import React, { useState } from 'react';
import { MyVariableQuery } from './types';
import { createGraphiQL } from './GraphiQLUtil';
import { DataSource } from './DataSource';

interface VariableQueryProps {
  query: MyVariableQuery;
  onChange: (query: MyVariableQuery, definition: string) => void;
  datasource: DataSource;
}

export const VariableQueryEditor: React.FC<VariableQueryProps> = ({ onChange, query, datasource }) => {
  const [state, setState] = useState(query);

  const saveQuery = () => {
    onChange(state, `${state.queryText} (${state.dataPath})`);
  };

  const onChangeQuery = (value?: string) => {
    if (value !== undefined) {
      setState({
        ...state,
        queryText: value,
      });
      saveQuery();
    }
  };

  const handleChange = (event: React.FormEvent<HTMLInputElement>) =>
    setState({
      ...state,
      [event.currentTarget.name]: event.currentTarget.value,
    });

  const graphiQL = createGraphiQL(datasource, state.queryText || '', onChangeQuery);

  return (
    <>
      <div className="gf-form">
        <span className="gf-form-label width-10">Data Path</span>
        <input
          name="dataPath"
          className="gf-form-input"
          onBlur={saveQuery}
          onChange={handleChange}
          value={state.dataPath}
        />
      </div>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.23.0/theme/dracula.css" />
      <div
        style={{
          height: '50vh',
        }}
      >
        {graphiQL}
      </div>
    </>
  );
};
