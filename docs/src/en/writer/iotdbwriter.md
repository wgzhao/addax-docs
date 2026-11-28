# IoTDB Writer

The IoTDB Writer plugin writes data to [Apache IoTDB](https://iotdb.apache.org). The tree model is
written through the IoTDB Session API; the table model is written through JDBC batches.

## Configuration Example

This example writes generated records to one tree-model device:

<<<@/public/assets/jobs/iotdbwriter.json

Save the file as `job/stream2iotdb.json` and run:

```bash
bin/addax.sh job/stream2iotdb.json
```

## Parameters

| Configuration      | Required | Type   | Default | Description                                                                                   |
| :----------------- | :------: | ------ | ------- | --------------------------------------------------------------------------------------------- |
| username           |   Yes    | string | None    | IoTDB username                                                                                |
| password           |    No    | string | None    | IoTDB password                                                                                |
| connection.jdbcUrl |   Yes    | string | None    | JDBC URL, for example `jdbc:iotdb://127.0.0.1:6667/`                                          |
| sqlDialect         |    No    | string | tree    | `tree` or `table`; inferred from `sql_dialect` in the URL when omitted                        |
| device             |   Yes    | string | None    | Tree-model target device, for example `root.factory.device1`                                  |
| measurements       |   Yes    | list   | None    | Tree-model measurement names, in record order after the time column                           |
| columnType         |    No    | list   | None    | Tree-model types: `INT32`, `INT64`, `FLOAT`, `DOUBLE`, `BOOLEAN`, `TEXT`, `TIMESTAMP`, `BLOB` |
| table              |   Yes    | string | None    | Table-model target in `database.table` form                                                   |
| column             |   Yes    | list   | None    | Table-model insert columns; the time column must be included                                  |
| timeColumnPosition |    No    | int    | 0       | Position of the time column in the record                                                     |
| batchSize          |    No    | int    | 1000    | Records per batch                                                                             |
| preSql             |    No    | list   | None    | SQL run once before the tasks start; supports `${table}` / `${device}`                        |
| postSql            |    No    | list   | None    | SQL run once after the tasks finish; same placeholders                                        |

## Tree Model

A tree-model record must contain `measurements.size() + 1` columns: the time column at
`timeColumnPosition`, and the remaining columns mapped to `measurements` in order. The plugin writes
them with `Session.insertRecordsOfOneDevice`.

```json
{
  "device": "root.demo.d1",
  "measurements": ["s1", "s2"],
  "timeColumnPosition": 0,
  "batchSize": 1000
}
```

### columnType

Without `columnType`, the plugin infers the IoTDB type from the first non-null value of each
measurement in the batch:

- Addax Long → `INT64`
- Addax Double → `DOUBLE`
- Addax String → `TEXT`
- Addax Boolean → `BOOLEAN`
- Addax Date/Timestamp → `TIMESTAMP`
- Addax Bytes → `BLOB`

Configure `columnType` when a measurement is null in the first batch, or when a Long must be written
to `INT32` or a Double to `FLOAT`:

```json
{
  "measurements": ["s1", "s2"],
  "columnType": ["INT32", "DOUBLE"]
}
```

`columnType` must have the same order and length as `measurements`. A record whose value cannot be
converted to the configured type is collected as a dirty record.

## Table Model

A table-model record must contain exactly `column.size()` columns, with the time column at
`timeColumnPosition`. The target table must exist, or be created by `preSql`; the plugin reads the
target metadata (`SELECT ... WHERE 1 = 2`) to decide how to bind each parameter.

```json
{
  "sqlDialect": "table",
  "table": "demo.metrics",
  "column": ["time", "device_id", "temperature", "humidity"],
  "timeColumnPosition": 0,
  "batchSize": 1000
}
```

The table model only exists in IoTDB 2.x. A job pointed at a 1.x server fails during startup with a
message that a 2.x server is required.

## preSql / postSql

`preSql` runs once before all tasks start, and `postSql` runs once after all tasks succeed. `${table}`
and `${device}` are replaced with the configured target:

```json
{
  "preSql": [
    "CREATE TABLE demo.metrics (device_id STRING TAG, temperature FLOAT FIELD)"
  ],
  "postSql": ["DELETE FROM demo.metrics WHERE time < 0"]
}
```

## Type Conversion

| Addax Internal Type | IoTDB Data Type |
| ------------------- | --------------- |
| Long                | INT32, INT64    |
| Double              | FLOAT, DOUBLE   |
| String              | TEXT, STRING    |
| Boolean             | BOOLEAN         |
| Date/Timestamp      | TIMESTAMP, DATE |
| Bytes               | BLOB            |

The table model follows the target table schema and converts where possible. The tree model follows
`columnType`, or the inferred type when it is not configured.

## Supported Versions

- IoTDB 2.x: tree model and table model.
- IoTDB 1.3.7 and later: tree model only, best effort; the plugin uses a 2.0.x client and the vendor
  does not guarantee a newer client against an older server.
- IoTDB 1.0-1.2: not supported.

## Notes

- Time is handled in milliseconds, matching the IoTDB default precision; servers configured with
  microsecond or nanosecond precision are not supported yet.
- One device or table per job. Multi-device routing from a record column is not implemented yet.
- IoTDB writes are keyed by device/tag + time, so retrying a failed task overwrites the same rows
  instead of creating duplicates.
