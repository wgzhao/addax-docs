# IoTDB Reader

The IoTDB Reader plugin reads time-series data from [Apache IoTDB](https://iotdb.apache.org). It
supports both the tree model and the table model introduced in IoTDB 2.0.

## Configuration Example

This example reads two measurements of one tree-model device and prints them to the terminal:

<<<@/public/assets/jobs/iotdbreader.json

Save the file as `job/iotdb2stream.json` and run:

```bash
bin/addax.sh job/iotdb2stream.json
```

## Parameters

The configuration paths in the table below are relative to `reader.parameter`. `connection` may be written as an object or as a one-element array; when a multi-element array is supplied, only the first element is used.

### Configuration Structure

```text
parameter
├─ connection
│  ├─ jdbcUrl
│  └─ querySql
├─ username
├─ password
├─ sqlDialect
├─ device
├─ measurements
├─ where
├─ timeColumnPosition
├─ fetchSize
├─ table
├─ column
├─ beginDateTime
├─ endDateTime
└─ splitInterval
```

The tree shows the hierarchy only; required, type and default values are listed in the table below.

| Configuration Path  |     Required      | Type   | Default | Description                                                                                                                                              |
| :------------------ | :---------------: | ------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| connection          |        Yes        | object | None    | Connection information, see the child items below; may be written as an object or a one-element array                                                    |
| connection.jdbcUrl  |        Yes        | string | None    | JDBC URL, for example `jdbc:iotdb://127.0.0.1:6667/`                                                                                                     |
| connection.querySql |        No         | list   | None    | Custom SQL statements, one task per statement                                                                                                            |
| username            |        Yes        | string | None    | IoTDB username                                                                                                                                           |
| password            |        No         | string | None    | IoTDB password                                                                                                                                           |
| sqlDialect          |        No         | string | tree    | `tree` or `table`; inferred from `sql_dialect` in `connection.jdbcUrl` when omitted                                                                      |
| device              |        Yes        | string | None    | Tree-model device path, for example `root.factory.device1`; not needed when `connection.querySql` is set                                                 |
| measurements        |        Yes        | list   | None    | Tree-model measurement names, or `["*"]`; not needed when `connection.querySql` is set                                                                   |
| where               |        No         | string | None    | Time or measurement filter                                                                                                                               |
| timeColumnPosition  |        No         | int    | 0       | Position of the implicit time column in the output record                                                                                                |
| fetchSize           |        No         | int    | 10000   | Number of records fetched per JDBC round trip                                                                                                            |
| table               | Yes (table model) | string | None    | Table-model name in `database.table` form; not needed when `connection.querySql` is set; also accepted as `connection.table`, top-level takes precedence |
| column              |        No         | list   | `["*"]` | Table-model columns to read; cannot be combined with `*`; also accepted as `connection.column`, top-level takes precedence                               |
| beginDateTime       |        No         | string | None    | Inclusive start of a time-range split, `yyyy-MM-dd HH:mm:ss` or epoch milliseconds                                                                       |
| endDateTime         |        No         | string | None    | Exclusive end of a time-range split, same formats                                                                                                        |
| splitInterval       |        No         | string | None    | Time-range size, for example `1d`, `6h`, `30m`, `10s`, `500ms`                                                                                           |

`beginDateTime`, `endDateTime` and `splitInterval` must be configured together. A time-range split
cannot be combined with `connection.querySql`; use one or the other.

## Tree Model

A tree-model query always returns the time column first, even when `SELECT time` is not written
explicitly. The plugin inserts that implicit time column at `timeColumnPosition` (default `0`), so
the output record starts with time followed by `measurements`.

```json
{
  "device": "root.factory.device1",
  "measurements": ["temperature", "humidity"],
  "timeColumnPosition": 0
}
```

With `["*"]` the reader returns every measurement under the device. The set of measurements may
change over time, so production jobs should list the measurements explicitly.

### Parallel reads with connection.querySql

`connection.querySql` is the way to split a read manually, by time range or by device. Each statement becomes
one task:

```json
{
  "connection": {
    "jdbcUrl": "jdbc:iotdb://127.0.0.1:6667/",
    "querySql": [
      "SELECT s1,s2 FROM root.demo.d1 WHERE time >= 0 AND time < 2000",
      "SELECT s1,s2 FROM root.demo.d1 WHERE time >= 2000 AND time < 4000"
    ]
  },
  "timeColumnPosition": 0
}
```

When `connection.querySql` is set, `device`, `measurements`, `where` and the three time-range parameters are
ignored, and the SQL is used exactly as written.

### Time-range split

Without `connection.querySql`, the reader can generate time ranges itself. Each range adds
`WHERE (where) AND time >= begin AND time < end`:

```json
{
  "device": "root.demo.d1",
  "measurements": ["s1", "s2"],
  "beginDateTime": "2025-01-01 00:00:00",
  "endDateTime": "2025-01-02 00:00:00",
  "splitInterval": "1h"
}
```

The supported interval units are `d` (day), `h` (hour), `m` (minute), `s` (second) and `ms`
(millisecond). The boundaries are parsed in the default time zone of the JVM running the task.

## Table Model

The table model uses standard SQL. `table` is written as `database.table`, and `column` lists the
columns to read. The time column is only returned when it is listed in `column`; the plugin does not
insert it:

```json
{
  "sqlDialect": "table",
  "table": "demo.metrics",
  "column": ["time", "device_id", "temperature", "humidity"],
  "where": "time >= 1735689600000 AND time < 1735776000000"
}
```

The table model only exists in IoTDB 2.x. A job pointed at a 1.x server fails during startup with a
message that a 2.x server is required.

## Type Conversion

| Addax Internal Type | IoTDB Data Type |
| ------------------- | --------------- |
| Long                | INT32, INT64    |
| Double              | FLOAT, DOUBLE   |
| String              | TEXT, STRING    |
| Boolean             | BOOLEAN         |
| Date/Timestamp      | TIMESTAMP, DATE |
| Bytes               | BLOB            |

## Supported Versions

- IoTDB 2.x: tree model and table model.
- IoTDB 1.3.7 and later: tree model only, best effort; the plugin uses a 2.0.x client and the vendor
  does not guarantee a newer client against an older server.
- IoTDB 1.0-1.2: not supported.

## Notes

- Time is handled in milliseconds, matching the IoTDB default precision; servers configured with
  microsecond or nanosecond precision are not supported yet.
- One connection per job. `connection` accepts an object or a one-element array.
- A tree-model aggregate query that does not return a time column is passed through as a normal
  result set; the reader does not insert a time column in that case.
