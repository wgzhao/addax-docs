# MySQL Reader

The MysqlReader plugin provides the ability to read data from MySQL.

## Example

We create the following table in the `test` database of MySQL and insert one record:

<<<@/public/assets/sql/mysql.sql

The following configuration is a job that reads this table to the terminal:

<<<@/public/assets/jobs/mysqlreader.json

Save the above configuration file as `job/mysql2stream.json`

### Execute Collection Command

Execute the following command for data collection

```bash
bin/addax.sh job/mysql2stream.json
```

## Parameters

This plugin is based on [RDBMS Reader](rdbmsreader), so you can refer to all configuration items of RDBMS Reader.

### Configuration Structure

<!--@include: @/src/_partials/reader/rdbms-structure.md#base -->

The tree shows the hierarchy only; see the [RDBMS Reader](rdbmsreader) parameter table for required flags, types and default values. The driver class name goes under `connection.driver`; the top-level `driver` is a deprecated legacy form that still works but logs a warning.

### driver

The current Addax uses a MySQL JDBC driver of version 8.0 or later, and the driver class name is `com.mysql.cj.jdbc.Driver` rather than `com.mysql.jdbc.Driver`. If the MySQL server you need to collect from is lower than `5.6` and you need to use the `Connector/J 5.1` driver, you can take the following steps:

**Replace the built-in driver**

`rm -f plugin/reader/mysqlreader/libs/mysql-connector-java-*.jar`

**Copy the old driver to the plugin directory**

`cp mysql-connector-java-5.1.48.jar plugin/reader/mysqlreader/libs/`

**Specify the driver class name**

In your JSON file, configure `connection.driver` as `"com.mysql.jdbc.Driver"`

## Data Type Mapping Notes

- `tinyint(1)` is treated as an integer
- `year` is treated as an integer
- `bit(1)` is treated as a boolean
- `bit(n)` (n > 1) is treated as a binary type whose content is the packed bit value as bytes: 8 bits per byte, most significant bit first, for example `b'101'` in `bit(3)` yields the single byte `0x05`

## Notes

1. When using `autoPk` or `splitPk`, if the selected field type is a character type and the `COLLATE` set on that field is a case-insensitive character set such as `utf8_general_ci` or `utf8mb4_general_ci`, data duplication occurs. Therefore, avoid using a case-insensitive character set.
