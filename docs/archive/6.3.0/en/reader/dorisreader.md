# Doris Reader

The DorisReader plugin provides the ability to read data from Apache Doris using the Arrow Flight SQL protocol.

If you prefer to connect to Doris in a MySQL-compatible way, you can use the [MySQLReader plugin](mysqlreader.md) instead.

## Prerequisites

Both BE and FE nodes in the Doris cluster must have the `arrow_flight_sql_port` configured. For detailed configuration, refer to the [Doris official documentation](https://doris.apache.org/zh-CN/docs/2.1/db-connect/arrow-flight-sql-connect).

## Example

The following example configuration uses the Arrow Flight SQL protocol to read data from Doris and output it to the console:

<<<@/public/assets/jobs/dorisreader.json

Save the configuration above as `job/doris2stream.json`.

### Run the job

```shell
bin/addax.sh job/doris2stream.json
```

## Configuration

This plugin is implemented on top of the [RDBMS Reader](rdbmsreader.md), so please refer to RDBMS Reader for all supported configuration options.

## JVM Compatibility

When running Arrow Flight SQL with Java 9 or later, add the following JVM argument:

```shell
--add-opens=java.base/java.nio=ALL-UNNAMED
```

## Notes

- This plugin is supported starting from Addax version 6.0.10. Ensure your Addax version meets this requirement before using the plugin.
- Arrow Flight SQL and the MySQL protocol use different parameters; please follow the Doris official documentation when configuring connections.
