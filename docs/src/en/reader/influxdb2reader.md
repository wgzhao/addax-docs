# InfluxDB2 Reader

InfluxDB2 Reader plugin implements reading data from [InfluxDB](https://www.influxdata.com) version 2.0 and above.

Note: support for InfluxDB 1.8 and below was removed in 6.0.11; this plugin requires InfluxDB 2.0 or later.

## Example

The following example demonstrates how this plugin reads data from specified tables (i.e., metrics) and outputs to terminal.

### Create Job File

Create `job/influx2stream.json` file with the following content:

<<<@/public/assets/jobs/influx2stream.json

### Run

Execute the following command for data collection

```bash
bin/addax.sh job/influx2stream.json
```

## Parameters

| Configuration | Required | Data Type | Default Value | Description                                                                                              |
| :------------ | :------: | --------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| endpoint      |   Yes    | string    | None          | InfluxDB connection string                                                                               |
| token         |   Yes    | string    | None          | Token for accessing database                                                                             |
| table         |    No    | list      | None          | Selected table names (i.e., metrics) to be synchronized, every metric of the bucket is read when omitted |
| org           |   Yes    | string    | None          | Specify InfluxDB org name                                                                                |
| bucket        |   Yes    | string    | None          | Specify InfluxDB bucket name                                                                             |
| column        |    No    | list      | None          | Collection of column names to be synchronized in configured table, see below                             |
| range         |   Yes    | list      | None          | Time range for reading data                                                                              |
| limit         |    No    | int       | None          | Limit number of records to get, N records per metric and tag combination, see below                      |

### column

The columns are resolved from the InfluxDB index and do not depend on the write time, so they are known even when the time range holds no data.

- If `column` is not specified, or `column` is specified as `["*"]`, `_time`, all tag columns and all field columns are read. The `_measurement` column is added as well when `table` holds more than one metric, otherwise the rows cannot be told apart
- When `column` is specified explicitly, only the records carrying these fields are read, so records of a metric that lacks the requested fields are not returned
- A column that does not exist makes the job fail with the list of the available columns

### range

`range` is used to specify the time range for reading metrics, with the following format:

```json
{
  "range": ["start_time", "end_time"]
}
```

`range` consists of a list of one or two strings, the first string represents start time and is mandatory, the second represents end time and may be omitted. The time expression format must comply with [Flux format requirements][2], like this:

```json
{
  "range": ["-15h", "-2h"]
}
```

If you don't want to specify the second end time, you can omit it, like this:

```json
{
  "range": ["-15h"]
}
```

`range` holds Flux time literals, both a relative duration (`-15h`) and an absolute time (`2018-11-01T00:00:00Z`) are accepted, but **an absolute time must not be quoted** — `"2018-11-01T00:00:00Z"` is rejected by InfluxDB.

## Type Conversion

| InfluxDB type                   | Converted type |
| :------------------------------ | :------------- |
| long/unsignedLong               | integer        |
| double                          | float          |
| boolean                         | boolean        |
| dateTime                        | timestamp      |
| anything else (string included) | string         |
| empty value                     | NULL           |

## Behavior

- An empty time range is not an error: the job finishes normally with 0 records
- A `table` or `column` that does not exist makes the job fail, listing the available metrics/columns

## Limitations

1. Current plugin only supports version 2.0 and above
2. `limit` follows the Flux `limit()` semantics: N records **per metric and tag combination**, not N records in total
3. `setting.speed.channel` has no effect on this plugin, the read is always done by a single task

[2]: https://docs.influxdata.com/influxdb/v2.0/query-data/flux/
