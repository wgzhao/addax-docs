# Iceberg Writer

Iceberg Writer plugin implements writing data to Apache Iceberg.

## Configuration Example

This plugin is used to write data to Iceberg tables. For detailed configuration and parameters, please refer to the original Iceberg Writer documentation.

<<<@/public/assets/jobs/icebergwriter.json

## Parameters

This plugin supports writing data to Iceberg with configurable catalog, table, and partition options.

`hadoopConfig` is optional. When it is left out, the plugin uses the hadoop configuration on the classpath, that is the defaults from `core-site.xml` and the like.

## Type mapping

The Chinese page carries the table that maps the Addax column types to the Iceberg types. For the Iceberg types that table does not list:

- `TIME` takes the time of day of a date or time column, `UUID` is parsed from a string, and `FIXED` is written from a bytes column.
- The element type of an `ARRAY`, and the key and value types of a `MAP`, are the ones the table declares, and the source text is parsed into them: `'1,2,3'` into an `array<int>`, `'{"a":"1"}'` into a `map<string,bigint>`.
- `struct`, `variant`, and a struct nested under an `array` or a `map`, are not written: a job that maps such a column fails at the first record instead of writing nulls.
- A row whose value does not fit the column it maps to is skipped and counted as dirty, rather than written with a null.
