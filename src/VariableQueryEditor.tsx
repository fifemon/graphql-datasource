import { QueryField } from '@grafana/ui';
import React, { useState } from 'react';
import { MyQuery } from './types';

interface VariableQueryProps {
  query: MyQuery;
  onChange: (query: MyQuery, definition: string) => void;
}

export const VariableQueryEditor: React.FC<VariableQueryProps> = ({ onChange, query }) => {
  const [state, setState] = useState(query);

  const saveQuery = () => {
    onChange(state, `${state.queryText} (${state.dataPath})`);
  };

  const onChangeQuery = (value: string, override?: boolean) =>
    setState({
      ...state,
      queryText: value,
    });

  const handleChange = (event: React.FormEvent<HTMLInputElement>) =>
    setState({
      ...state,
      [event.currentTarget.name]: event.currentTarget.value,
    });

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
      <div className="gf-form">
        <span className="gf-form-label width-10">Query</span>
        <QueryField query={state.queryText || ''} onBlur={saveQuery} onChange={onChangeQuery} portalOrigin="graphQL" />
      </div>
    </>
  );
};
