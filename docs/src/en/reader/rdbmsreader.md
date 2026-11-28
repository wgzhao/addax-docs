# RDBMS Reader

The RDBMS Reader plugin supports reading data from traditional RDBMS. It is a generic relational database reader plugin that can support more relational databases by registering database drivers and other means.

RDBMS Reader is also the base class of other relational database reader plugins. The following reader plugins all depend on it:

- [Oracle Reader](oraclereader)
- [MySQL Reader](mysqlreader)
- [PostgreSQL Reader](postgresqlreader)
- [ClickHouse Reader](clickhousereader)
- [SQLServer Reader](sqlserverreader)
- [Access Reader](accessreader)
- [Databend Reader](databendreader)
- [HANA Reader](hanareader)
- [Sybase Reader](sybasereader)
- [SQLite Reader](sqlitereader)
- [DuckDB Reader](duckdbreader)

::: warning Prefer a dedicated plugin
If a dedicated database reader plugin is already provided, use it. Consider this generic plugin only when the target database has no dedicated plugin; before use you also need to complete the driver configuration described below, otherwise the job fails at startup.
:::

## Configure Driver

Suppose you need to read data from IBM DB2. Because no dedicated reader plugin is provided, we can use this plugin to do it. Before use, download the corresponding JDBC driver and copy it to the `plugin/reader/rdbmsreader/libs` directory.
If your driver class name is unusual, fill in the correct JDBC driver name in `reader.parameter.connection.driver` of the task configuration file, for example the DB2 driver name `com.ibm.db2.jcc.DB2Driver`. The legacy form `reader.parameter.driver` is still compatible but prints a deprecation warning. If it is left empty, the plugin guesses the driver name automatically.

The following lists common databases and their corresponding driver names:

- [Apache Impala](http://impala.apache.org/): `com.cloudera.impala.jdbc41.Driver`
- [Enterprise DB](https://www.enterprisedb.com/): `com.edb.Driver`
- [PrestoDB](https://prestodb.io/): `com.facebook.presto.jdbc.PrestoDriver`
- [IBM DB2](https://www.ibm.com/analytics/db2): `com.ibm.db2.jcc.DB2Driver`
- [MySQL](https://www.mysql.com): `com.mysql.cj.jdbc.Driver`
- [Sybase Server](https://www.sap.com/products/sybase-ase.html): `com.sybase.jdbc3.jdbc.SybDriver`
- [TDengine](https://www.taosdata.com/cn/): `com.taosdata.jdbc.TSDBDriver`
- [达梦数据库](https://www.dameng.com/): `dm.jdbc.driver.DmDriver`
- [星环Inceptor](http://transwarp.io/): `io.transwarp.jdbc.InceptorDriver`
- [TrinoDB](https://trino.io): `io.trino.jdbc.TrinoDriver`
- [PrestoSQL](https://trino.io): `io.prestosql.jdbc.PrestoDriver`
- [Oracle DB](https://www.oracle.com/database/): `oracle.jdbc.OracleDriver`
- [PostgreSQL](https://postgresql.org): `org.postgresql.Driver`

## Configuration Example

The following configuration shows how to read data from a Presto database to the terminal:

<<<@/public/assets/jobs/rdbmsreader.json

## Parameters

The configuration paths in the table below are rooted at `reader.parameter`. `connection` can be written either as an object or as an array containing a single element; when written as a multi-element array, only the first element takes effect.

### Configuration Structure

<!--@include: @/src/_partials/reader/rdbms-structure.md#base -->

The tree above shows the configuration hierarchy only; whether an item is required, its data type and default value are listed in the table below.

| Configuration Path  | Required              | Data Type | Default Value | Description                                                                                                                                                                                                                                                          |
| :------------------ | :-------------------: | :-------- | :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| connection          | Yes                   | object    | None          | Connection information, see the child items below; can be written as an object or as an array containing a single element                                                                                                                                            |
| connection.jdbcUrl  | Yes                   | string    | None          | JDBC connection information of the target database; jdbcUrl follows the RDBMS official specification and may include connection attachment control information                                                                                                       |
| connection.table    | Yes (table mode)      | list      | None          | Table names to be synchronized, in JSON data format; when configured with multiple tables, users must ensure that the tables share the same table structure. Mutually exclusive with `connection.querySql`                                                           |
| connection.querySql | No                    | list      | None          | Use custom SQL instead of specifying tables to fetch data, mutually exclusive with `connection.table`; when configured, the `column` option is ignored                                                                                                               |
| connection.driver   | No                    | string    | None          | Custom driver class name; when not configured, it is guessed from `connection.jdbcUrl`. The top-level `driver` is a deprecated legacy form that is still compatible but prints a deprecation warning; when both are configured, `connection.driver` takes precedence |
| username            | Yes                   | string    | None          | Username of the data source                                                                                                                                                                                                                                          |
| password            | No                    | string    | None          | Password for the specified username of the data source                                                                                                                                                                                                               |
| column              | Yes (table mode)      | list      | None          | Set of column names to be synchronized from the configured tables; not required when `connection.querySql` is configured, see the detailed description below                                                                                                         |
| excludeColumn       | No                    | list      | None          | Column names to be excluded, effective only when `column` is configured as `*`                                                                                                                                                                                       |
| splitPk             | No                    | string    | None          | Use the field represented by splitPk for data sharding, which greatly improves data synchronization performance; see the notes below                                                                                                                                 |
| autoPk              | No                    | boolean   | false         | Whether to guess the sharding primary key automatically, introduced in `3.2.6`, see the description below                                                                                                                                                            |
| where               | No                    | string    | None          | Filter condition for the table                                                                                                                                                                                                                                       |
| session             | No                    | list      | None          | For local connections, modify the session configuration, see below                                                                                                                                                                                                   |
| fetchSize           | No                    | int       | 1024          | Defines the number of records fetched per batch between the plugin and the database server; increasing this value may cause Addax OOM                                                                                                                                |

### connection.jdbcUrl

Besides the required information, `jdbcUrl` can also carry driver-specific configuration properties. In particular, these properties can be used to access a database through a proxy. For example, the PrestoSQL JDBC driver supports the `socksProxy` parameter, so the `jdbcUrl` above can be changed to

`jdbc:presto://127.0.0.1:8080/hive?socksProxy=192.168.1.101:1081`

JDBC drivers of most relational databases support the `socksProxyHost,socksProxyPort` parameters for proxy access. There are also some special cases.

The following lists the proxy types and configuration methods supported by JDBC drivers of various databases:

| Database | Proxy Type | Proxy Configuration           | Example                                            |
| -------- | ---------- | ----------------------------- | -------------------------------------------------- |
| MySQL    | socks      | socksProxyHost,socksProxyPort | `socksProxyHost=192.168.1.101&socksProxyPort=1081` |
| Presto   | socks      | socksProxy                    | `socksProxy=192.168.1.101:1081`                    |
| Presto   | http       | httpProxy                     | `httpProxy=192.168.1.101:3128`                     |

### connection.table

The table names to be synchronized. When configured with multiple tables, users must ensure that the tables share the same table structure. Multiple tables can be configured with regular expressions, for example both `["t1", "t2", "t3"]` and `["t[1-3]"]` select the three tables `t1`, `t2` and `t3`. The two forms can also be mixed, for example:

```json
{
  "connection": {
    "table": ["t1", "tbl[2-3]"]
  }
}
```

The configuration above selects the three tables `t1`, `tbl2` and `tbl3` for synchronization.

### connection.driver

In most cases the JDBC driver of a database is fixed, but for some databases the recommended driver class name differs between versions, such as MySQL. The new MySQL JDBC driver type recommends `com.mysql.cj.jdbc.Driver` instead of the former `com.mysql.jdbc.Driver`. If you want to use the old driver name, configure `connection.driver`. The top-level `driver` is a deprecated legacy form that is still compatible but prints a deprecation warning; when both are configured, `connection.driver` takes precedence. Otherwise the plugin guesses the driver name automatically from the string in `connection.jdbcUrl`.

### column

The set of column names to be synchronized from the configured tables, described as field information in a JSON array. Users use `*` to mean that all columns are used by default, for example `["*"]`.

Column pruning is supported, that is, only some of the columns can be selected for export.

Column reordering is supported, that is, columns can be exported in an order other than the table schema.

Constant configuration is supported, in JSON format:

``["id", "`table`", "1", "'bazhen.csy'", "null", "to_char(a + 1)", "2.3" , "true"]``

- `id` is an ordinary column name
- `` `table` `` is a column name containing reserved words,
- `1` is an integer constant,
- `'bazhen.csy'` is a string constant
- `null` is the null pointer; note that `null` here must appear as a string, that is, quoted with double quotes
- `to_char(a + 1)` is an expression,
- `2.3` is a floating point number,
- `true` is a boolean value; likewise, the boolean value here must be quoted with double quotes

::: important
`column` must be filled in explicitly and is not allowed to be empty.
:::

### excludeColumn

There is a situation where we need to read most fields of a table; if the table has a large number of fields, configuring `column` is obviously time-consuming.
In particular, when business data is collected into a big data platform, we usually add some extra fields including partition fields and collection information, and when we need to write the business data back to the business tables, these fields need to be excluded.
For this reason we introduced the `excludeColumn` configuration item; when `column` is configured as `*`, the `excludeColumn` configuration item takes effect and is used to exclude some fields.

For example:

```json
{
  "column": ["*"],
  "excludeColumn": ["etl_time", "etl_source", "dt"]
}
```

### splitPk

If `splitPk` is specified, the user wants to shard data using the field represented by `splitPk`, so concurrent tasks are started for data synchronization, which greatly improves data synchronization performance.

Users are advised to use the table primary key for `splitPk`, because a primary key is usually fairly uniform, so the resulting shards are unlikely to suffer from data hotspots.

Currently `splitPk` supports sharding on integer and string (ASCII) data only, and does not support other types such as floating point and date. If a user specifies another unsupported type, RDBMSReader reports an error!

If `splitPk` is not filled in, it is considered that the user does not shard a single table and uses a single channel to synchronize the full data set.

### autoPk

Since version `3.2.6`, the primary key or unique index of a table can be obtained automatically. If set to `true`, the program guesses the fields that can be used to split the table by querying the database metadata for fields of the specified table that have a primary key or a single-field unique index,
and if multiple fields qualify, numeric fields are preferred over character fields. If no field qualifies, the table is not split.
If `autoPk` is configured, the job prints log output similar to the following during execution:

```
2025-04-13 23:17:11.036 [ job-0] INFO CommonRdbmsReader$Job - The split key is not configured, try to guess the split key.
2025-04-13 23:17:11.059 [       job-0] INFO  CommonRdbmsReader$Job - Take the field id as split key
```

Databases currently supported by this feature are:

- ClickHouse
- MySQL
- Oracle
- PostgreSQL
- SQL Server
- SQLite
- Sybase ASE

::: warning
Note that if both `splitPk` and `autoPk` are configured, `splitPk` takes precedence and `autoPk` is ignored.
:::

### session

Controls settings such as the time format and time zone used when writing data; currently effective only for `MySQL`, `Oracle` and `SQLServer`. The following is an example of configuring `session` for an Oracle database.

```json
{
  "session": [
    "alter session set NLS_DATE_FORMAT='yyyy-mm-dd hh24:mi:ss'",
    "alter session set NLS_TIMESTAMP_FORMAT='yyyy-mm-dd hh24:mi:ss'",
    "alter session set NLS_TIMESTAMP_TZ_FORMAT='yyyy-mm-dd hh24:mi:ss'",
    "alter session set TIME_ZONE='Asia/Chongqing'"
  ]
}
```

Note that `&quot;` is the escaped string for `"`

### connection.querySql

If `querySql` is configured, custom SQL is used instead of a specified table to fetch data. In addition, `querySql` supports reading a SQL file from outside, which also reduces the difficulty of writing complex SQL into a `json` file.
Suppose the file `/tmp/t.sql` has the following content:

```sql
select * from t where id < 10
```

Then it can be configured as follows:

```json
{
  "connection": {
    "querySql": ["@/tmp/t.sql"]
  }
}
```

## Type Conversion

| Addax internal type | RDBMS data type                                               |
| ------------------- | ------------------------------------------------------------- |
| Long                | int, tinyint, smallint, mediumint, int, bigint                |
| Double              | float, double, decimal                                        |
| String              | varchar, char, tinytext, text, mediumtext, longtext, year,xml |
| Date                | date, datetime, timestamp, time                               |
| Boolean             | bit, bool                                                     |
| Bytes               | tinyblob, mediumblob, blob, longblob, varbinary               |
