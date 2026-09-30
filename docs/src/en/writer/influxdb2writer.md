# InfluxDB2 Writer

InfluxDB2 Writer plugin implements writing data to [InfluxDB](https://www.influxdata.com) version 2.0 and above.

Note: support for InfluxDB 1.8 and below was removed in 6.0.11; this plugin requires InfluxDB 2.0 or later.

## Example

The following example demonstrates how this plugin reads data from memory and writes it to the configured table.

### Create Job File

Create `job/stream2influx2.json` file with the following content:

<<<@/public/assets/jobs/stream2influx2.json

### Run

Execute the following command for data collection

```bash
bin/addax.sh job/stream2influx2.json
```

## Parameters

| Configuration | Required | Data Type   | Default Value | Description                                                                 |
| :------------ | :------: | ----------- | ------------- | --------------------------------------------------------------------------- |
| endpoint      |   Yes    | string      | None          | InfluxDB connection string                                                  |
| table         |   Yes    | string      | None          | Table (i.e., measurement) to be written                                     |
| org           |   Yes    | string      | None          | Specify InfluxDB org name                                                   |
| bucket        |   Yes    | string      | None          | Specify InfluxDB bucket name                                                |
| token         |   Yes    | string      | None          | Token for accessing database                                                |
| column        |   Yes    | list        | None          | Collection of column names to be synchronized, see below                    |
| tag           |    No    | `list<map>` | None          | Tags shared by every record, the values are constants                       |
| tagColumns    |    No    | list        | None          | Tags whose value comes from a column, every name must be listed in `column` |
| interval      |    No    | string      | ms            | Time precision, one of `s`, `ms`, `us`, `ns`                                |
| batchSize     |    No    | int         | 2048          | Number of points written by a single HTTP request                           |

### column

InfluxDB is a time series database and needs a timestamp per record, so the first field of every record is written
as the timestamp and `column` only lists the remaining fields. In the example above `streamreader` produces 4 fields
while `column` only names three of them, because the first field already is the timestamp.

The names map to the record by **position**, not by name: the n-th name of `column` is the n+1-th column of the
record. The record therefore has to hold exactly one more column than `column` names, otherwise the job fails
instead of writing the wrong field or dropping a column. `column` is mandatory, its names must be unique and `*`
is not supported.

### tag

Specifies the tags of the measurement (the table here), every tag is a map, for instance:

```json
{
  "tag": [
    {
      "location": "east"
    },
    {
      "lat": 23.123445
    }
  ]
}
```

The key of the map is the tag name and the value is the tag value. A tag value of InfluxDB is a string, so a value
is written in its string form and a numeric tag only supports an equality match: the `23.123445` above is stored
as `"23.123445"`. The value has to be a scalar, a null or a nested object is rejected.

A tag and a field may share a name (InfluxDB keeps them apart) and both are written.

### tagColumns

The values of `tag` are constants and cannot express a tag whose value differs per record. `tagColumns` lists the
names of `column` whose **values** are written as a tag of the same name instead of a field:

```json
{
  "column": ["host", "usage_user"],
  "tagColumns": ["host"]
}
```

The value of the `host` column becomes a tag, which keeps the tags of the source intact when the plugin is
combined with `influxdb2reader` (the reader hands a tag over as an ordinary column, which the writer would
otherwise store as a field).

An empty value leaves the tag out, the record itself is still written. When a name is configured in both `tag`
and `tagColumns`, the value of the column wins.

### interval

Sets the precision of the timestamp, the values come from [WritePrecision.java][2] of
[influxdb-client-java][1]:

- s : seconds
- ms : milliseconds
- us : microseconds
- ns : nanoseconds

The first field (the timestamp field) accepts:

- a timestamp column (`TimestampColumn`, `DateColumn`): its value is used as it is
- a numeric column (`LongColumn`, `DoubleColumn`): read as epoch milliseconds
- a string column: parsed as `yyyy-MM-dd HH:mm:ss[.SSS]` (in the JVM time zone), as an ISO-8601 date time
  (with or without an offset, e.g. `2026-09-30T10:00:00Z`) or as epoch milliseconds, whichever matches first

An empty first field fails the job, a point of InfluxDB always carries a time.

## Type Conversion

| Source column type                   | Written as            | Note                          |
| :----------------------------------- | :-------------------- | :---------------------------- |
| LONG                                 | integer               |                               |
| DOUBLE                               | float                 | a NaN/Infinity is not written |
| BOOL                                 | boolean               |                               |
| DATE/TIMESTAMP outside the first one | string (RFC3339)      | e.g. `2026-09-30T10:00:00Z`   |
| STRING/BYTES and anything else       | string                |                               |
| empty value                          | the field is left out | InfluxDB has no null          |

A record whose fields are all empty cannot be represented in InfluxDB and is skipped; the number of skipped
records is reported in a WARN at the end of the task.

## Behavior

- A failed write (network error, 401, 404, 413, 422, ...) fails the job and names the number of points and the
  bucket, so a job never reports a success for data the server rejected
- `batchSize` is the number of points of a single HTTP request, the request body is gzip compressed
- A `setting.speed.channel` above 1 writes in parallel, one task per reader slice, each with its own connection
- An empty result set finishes normally and sends no request

## Limitations

1. Current plugin only supports version 2.0 and above
2. A failed write is not retried, the job has to be run again. Writing a point is idempotent in InfluxDB (the same
   measurement, tags and time overwrite each other), so re-running the job is safe
3. The measurement name always comes from `table`, it cannot be taken from a column; a tag comes from the `tag`
   constants or from the columns listed in `tagColumns`

[1]: https://github.com/influxdata/influxdb-client-java
[2]: https://github.com/influxdata/influxdb-client-java/blob/master/client/src/generated/java/com/influxdb/client/domain/WritePrecision.java
