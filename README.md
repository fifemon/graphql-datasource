# GraphQL Data Source

A (hopefully) generic datasource to pull data from a GraphQL API, initially
targeted at putting data into tables primarily, instead of timeseries graphs.

The GraphQL query must be structured so that the data is returned as a list of 
objects under `data.data` in the response.

## Current Features
* GraphQL query editor supporting Grafana variable substitution

# Wishlist
* Configurable response path handling
* Rich schema-aware editor (graphiql-like)
* Grafana variables are passed as GraphQL variables instead of directly substituted into the query