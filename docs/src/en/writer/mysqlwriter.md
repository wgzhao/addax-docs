# MySQL Writer

MySQL Writer plugin implements the functionality of writing data to [MySQL](https://mysql.com) destination tables.

## Example

Assume the MySQL table to be written has the following DDL statement:

create table test.addax_tbl
(
col1 varchar(20) ,
col2 int(4),
col3 datetime,
col4 boolean,
col5 binary
) default charset utf8;

Here we use data generated from memory to import into MySQL.

<<<@/public/assets/jobs/mysqlwriter.json
Save the above configuration file as `job/stream2mysql.json`

### Execute Collection Command

Execute the following command for data collection

```bash
bin/addax.sh job/stream2mysql.json
```

## Parameters

This plugin is based on [RDBMS Writer](rdbmswriter), so you can refer to all configuration items of RDBMS Writer, and adds some MySQL-specific configuration items.

| Configuration | Required | Type   | Default Value | Description                                                                           |
| :------------ | :------: | ------ | ------------- | ------------------------------------------------------------------------------------- |
| writeMode     |   Yes    | string | insert        | The way data is written to the table, see below                                       |
| batchSize     |    No    | int    | 1024          | Defines the number of batch data fetched between plugin and database server each time |

### driver

The current MySQL JDBC driver uses version 8.0 and above, with driver class name `com.mysql.cj.jdbc.Driver`, not `com.mysql.jdbc.Driver`.
If you need to collect from MySQL server below `5.6` and need to use `Connector/J 5.1` driver, you can take the following steps:

1. Replace the built-in driver in the plugin
   `rm -f plugin/writer/mysqlwriter/libs/mysql-connector-java-*.jar`

2. Copy the old driver to the plugin directory
   `cp mysql-connector-java-5.1.48.jar plugin/writer/mysqlwriter/libs/`

3. Specify driver class name
   In your json file, configure `"driver": "com.mysql.jdbc.Driver"`

### writeMode

- `insert` means using `insert into`
- `replace` means using `replace into` method
- `update` means using `ON DUPLICATE KEY UPDATE` statement

## Writing a bit Column

A `bit(n)` column (n > 1) accepts the following forms, and the value is stored in exactly the width
the target column declares:

| Source Column Type | Meaning                                                                                                                    | Example         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Bytes              | the value packed, 8 bits per byte, most significant byte first, which is the form an RDBMS reader gives for a `bit` column | `0x05` → `101`  |
| String             | a bit string, only the characters `0` and `1` are accepted                                                                 | `"101"` → `101` |
| Long/Double        | the number itself, the bit pattern being its binary form, whole numbers only                                               | `5` → `101`     |
| Boolean            | a single bit, the path a `bit(1)` column takes                                                                             | `true` → `1`    |

- These are collected as dirty records (governed by `errorLimit`): a bit string holding any other
  character, and a number with a fractional part. A value that needs more bits than the column has
  is left to MySQL's own conversion rules (an error in strict mode, truncation in non-strict mode).
- A decimal number delivered as a string is not read as a decimal: `"255"` is not 255 but an invalid
  bit string, so declare the source column as long or double instead.
- A `bit(1)` column is written from a boolean; a `tinyint(1)` column (including `boolean`) is written
  as an integer, because Addax appends `tinyInt1isBit=false` to the JDBC URL and the driver therefore
  never reports it as `bit`.
