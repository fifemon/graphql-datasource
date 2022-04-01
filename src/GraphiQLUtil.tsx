import { Fetcher } from 'graphiql/dist/components/GraphiQL';
import GraphiQL from 'graphiql';
import { DataSource } from './DataSource';
import { ToolbarButton } from 'graphiql/dist/components/ToolbarButton';
import React from 'react';

export function createGraphiQL(datasource: DataSource, queryText: string, onEditQuery: (query?: string) => void) {
  const headers: any = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  if (datasource.basicAuth) {
    headers['Authorization'] = datasource.basicAuth;
  }
  const fetcher: Fetcher = async (graphQLParams) => {
    const data = await fetch(datasource.url || '', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(graphQLParams),
      credentials: 'same-origin',
    });
    return data.json().catch(() => data.text());
  };
  const graphiqlReference: Array<GraphiQL | null> = [null];
  const handlePrettifyQuery = () => {
    graphiqlReference[0]?.handlePrettifyQuery();
  };
  const handleMergeQuery = () => {
    graphiqlReference[0]?.handleMergeQuery();
  };
  const handleCopyQuery = () => {
    graphiqlReference[0]?.handleCopyQuery();
  };
  return (
    <>
      <GraphiQL
        ref={(node) => {
          graphiqlReference[0] = node;
        }}
        query={queryText}
        fetcher={fetcher}
        editorTheme={'dracula'}
        onEditQuery={onEditQuery}
        // If we get around to adding variable support, we would make it visible in CSS, then use the onEditVariables
      >
        <GraphiQL.Toolbar>
          {/* In GraphiQL.tsx, there is stuff like this.handlePrettifyQuery,
                which we cannot do here because this does not refer to the GraphiQL object.
                We define those functions ourselves as a workaround.*/}
          <ToolbarButton onClick={handlePrettifyQuery} title="Prettify Query (Shift-Ctrl-P)" label="Prettify" />
          <ToolbarButton onClick={handleMergeQuery} title="Merge Query (Shift-Ctrl-M)" label="Merge" />
          <ToolbarButton onClick={handleCopyQuery} title="Copy Query (Shift-Ctrl-C)" label="Copy" />
          {/*The entire point of this whole GraphiQL.Toolbar thing is to remove the "history" button that would be right here*/}
        </GraphiQL.Toolbar>
      </GraphiQL>
    </>
  );
}
