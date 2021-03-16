# Changelog

## v1.3.0

- **improvement** Support key/value variables (@retzkek #48)
- **improvement** Configurable timePath and timeFormat (@retzkek #49)
- **documentation** rewrite examples to use the test data source, which provides
  an example server and dashboard that [users can
  install](https://github.com/fifemon/graphql-test-source) to learn and
  experiment with. (@retzkek #51)

## v1.2.0

- **improvement** Add support for dashboard variable queries (@ggranberry #38)
- **bug fix** Properly scope variables, fixes repeated panel queries (@retzkek #41)

## v1.1.4

- **improvement** Use templateSrv to interpolate timeFrom and timeTo variables. (@carvid #31)
- **bug fix** Fix error in isRFC3339_ISO6801 when field is non-string (@ricochet1k #32, @retzkek #33)

## v1.1.3

- use `QueryField` component for a nicer query editing experience (@michaelneale #24)
- packaging, documentation, and testing improvements (@michaelneale #27, @retzkek #29)
- **DEPRECATED**: no more Grafana 6 releases

## v1.1.2

- Fix aliases in Grafana 7

## v1.1.1

- Fixes error when null field in response

## v1.1.0

- **BREAKING**: top-level `data` should no longer be included in data paths
- support multiple data paths, comma-separated

## v1.0.0

Initial release, basic support for tabular and timeseries data and annotations.
