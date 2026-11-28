# TDengine Writer

The TDengine Writer plugin implements writing data into the [TDengine](https://www.taosdata.com/cn/) database system. In the underlying implementation, the TDengine Writer connects to a remote TDengine database through the JDBC JNI driver,
and executes the corresponding SQL statements to batch write data into the TDengine database.

## Prerequisites

Considering performance issues, this plugin uses the JDBC-JNI driver of TDengine, which directly calls the client API (`libtaos.so` or `taos.dll`) to send write and query requests to the `taosd` instance.
Therefore, the dynamic library link files need to be configured before use.

First copy `plugin/writer/tdenginewriter/libs/libtaos.so.2.0.16.0` to the `/usr/lib64` directory, then run the following commands to create the soft links

```bash
ln -sf /usr/lib64/libtaos.so.2.0.16.0 /usr/lib64/libtaos.so.1
ln -sf /usr/lib64/libtaos.so.1 /usr/lib64/libtaos.so
```

## Example

Assume the table to be written is as follows:

```sql
create table test.addax_test (
    ts timestamp,
    name nchar(100),
    file_size int,
    file_date timestamp,
    flag_open bool,
    memo nchar(100)
);
```

The configuration file is as follows

<<<@/public/assets/jobs/tdenginewriter.json

Save the above configuration file as `job/stream2tdengine.json`

### Run the Collection Command

Run the following command to collect data

```bash
bin/addax.sh job/tdengine2stream.json
```

The command output is similar to the following:

::: details Example Output {open}
<<<@/public/assets/output/tdenginewriter.txt
:::

## Parameters

This plugin is implemented based on the [RDBMS Writer](rdbmswriter), so all configuration items of the RDBMS Writer can be referred to, and some TDengine-specific configuration items have been added.

### Using the JDBC-RESTful Interface

If you do not want to depend on the local library, or do not have permission to use it, you can use the `JDBC-RESTful` interface to write to the table. Compared with JDBC-JNI, the configuration differences are:

- driverClass is specified as `com.taosdata.jdbc.rs.RestfulDriver`
- jdbcUrl starts with `jdbc:TAOS-RS://`;
- use `6041` as the connection port

So the `connection` in the above configuration should be modified as follows:

```json
{
  "connection": [
    {
      "jdbcUrl": "jdbc:TAOS-RS://127.0.0.1:6041/test",
      "table": ["addax_test"],
      "driver": "com.taosdata.jdbc.rs.RestfulDriver"
    }
  ]
}
```

## Type Conversion

Currently, the TDengine Reader supports all TDengine types, as follows

| Addax internal type | TDengine data type                        |
| ------------------- | ----------------------------------------- |
| Long                | SMALLINT, TINYINT, INT, BIGINT, TIMESTAMP |
| Double              | FLOAT, DOUBLE                             |
| String              | BINARY, NCHAR                             |
| Boolean             | BOOL                                      |

## Supported Versions

TDengine 2.0.16

## Limitations

- The TDengine JDBC-JNI driver and the dynamic library versions are required to match one-to-one, so if your database version is not `2.0.16`, you need to replace both the dynamic library and the JDBC driver in the plugin directory
- The minimum value of the TDengine timestamp field is `1500000000000` by default, that is, `2017-07-14 10:40:00.0`. If the timestamp you write is smaller than this value, an error will be reported
