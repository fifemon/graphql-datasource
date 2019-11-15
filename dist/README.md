# GraphQL Data Source

A (hopefully) generic datasource to pull data from a GraphQL API.

The GraphQL query must be structured so that the data is returned as a list of 
objects under `data.data` in the response. Timeseries data requires a field named `Time`.
Grafana variables can be substituted directly in the query (instead of using GraphQL variables).
Example query:

    query {
        data:submissions(user:"$user", from:"$timeFrom", to:"$timeTo"){
            Time:submitTime
            idle running completed
        }
    }

# Wishlist
* Configurable response path handling
* Rich schema-aware editor (graphiql-like)
* Grafana variables are passed as GraphQL variables instead of directly substituted into the query
* Schema-based field type handling
* Combine queries from multiple targets?