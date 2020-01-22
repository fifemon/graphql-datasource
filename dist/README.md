# GraphQL Data Source

A generic datasource to pull data from a GraphQL API. This is in early
development, and while it should mostly work it still has a lot of rough edges.

* The GraphQL query must be structured so that the data of interest is returned
under the configurable data path (default `data.data`) in the response. If the
objest at that path is an array it will be iterated over, with each object added
as a row in the data frame, otherwise the result object will be the only row.
* Timeseries data requires a field named `Time` containing the timestamp in a
format that can be parsed by `moment()` (e.g. ISO8601). 
* Nested types will be flattened into dot-delimited fields. 
* Grafana variables should be substituted directly in the query (instead of
using GraphQL variables). The dashboard time ranges are available in `$timeFrom`
and `$timeTo` variables as millisecond epoch.

Example query (data path `data.data`):

    query {
        data:submissions(user:"$user", from:"$timeFrom", to:"$timeTo"){
            Time:submitTime
            idle running completed
        }
    }



# Wishlist
* Rich schema-aware editor (graphiql-like)
* Grafana variables are passed as GraphQL variables instead of directly substituted into the query
* Schema-based field type handling
* Combine queries from multiple targets?
