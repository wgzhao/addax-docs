# RDBMS Writer

RDBMS Writer plugin supports writing data to traditional RDBMS. This is a generic relational database writer plugin that can support more relational database writing by registering database drivers.

At the same time, RDBMS Writer is also the base class for other relational database writer plugins. The following writer plugins all depend on this plugin:

- [Oracle Writer](oraclewriter)
- [MySQL Writer](mysqlwriter)
- [PostgreSQL Writer](postgresqlwriter)
- [ClickHouse Writer](clickhousewriter)
- [SQLServer Writer](sqlserverwriter)
- [Access Writer](accesswriter)
- [Databend Writer](databendwriter)
- [HANA Writer](hanawriter)
- [Sybase Writer](sybasewriter)
- [SQLite Writer](sqlitewriter)
- [DuckDB Writer](duckdbwriter)

::: warning Prefer a dedicated plugin
If a dedicated database writer plugin exists, use it. Only fall back to this generic plugin when your database has no dedicated plugin, and configure the driver described below first — otherwise the job fails at startup.
:::

## Configure Driver

Suppose you need to write data to IBM DB2. Since no dedicated writer plugin is provided, we can use this plugin to implement it. Before use, you need to perform the following two operations:

1. Download the corresponding JDBC driver and copy it to the `plugin/writer/rdbmswriter/libs` directory
2. Modify the task configuration file and fill in the correct JDBC driver name in `writer.parameter.connection.driver`, such as DB2's driver name `com.ibm.db2.jcc.DB2Driver`. The legacy `writer.parameter.driver` is still accepted but logs a deprecation warning

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

Configure a job to write to RDBMS.

<<<@/public/assets/jobs/rdbmswriter.json

## Parameters

The configuration paths in the table below are relative to `writer.parameter`. `connection` may be written as an object or as a one-element array; when a multi-element array is supplied, only the first element is used.

### Configuration Structure

<!--@include: @/src/_partials/writer/rdbms-structure.md#base -->

The tree shows the hierarchy only; required, data type and default values are listed in the table below.

| Configuration Path | Required | Data Type | Default Value | Description                                                                                                                                                                                                               |
| :----------------- | :------: | --------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| connection         |   Yes    | object    | None          | Connection information, see the child items below; may be written as an object or a one-element array                                                                                                                     |
| connection.jdbcUrl |   Yes    | string    | None          | JDBC connection information of the target database, jdbcUrl follows RDBMS official specifications and can include connection attachment control information                                                               |
| connection.table   |   Yes    | list      | None          | Selected table names to be synchronized, using JSON data format. When configured for multiple tables, users need to ensure that multiple tables have the same table structure                                             |
| connection.driver  |   Yes    | string    | None          | Custom driver class name, required by the generic RDBMS Writer; the top-level `driver` is a deprecated legacy form that still works but logs a warning, and `connection.driver` takes precedence when both are configured |
| username           |   Yes    | string    | None          | Username of the data source                                                                                                                                                                                               |
| password           |    No    | string    | None          | Password for the specified username of the data source                                                                                                                                                                    |
| column             |   Yes    | list      | None          | Collection of column names to be synchronized in the configured table, detailed description below                                                                                                                         |
| preSql             |    No    | list      | None          | SQL statement executed first before the data synchronization task; currently only one SQL statement is allowed, for example to clear old data; `@table` can be used to refer to the table involved                           |
| postSql            |    No    | list      | None          | SQL statement executed after the data synchronization task; currently only one SQL statement is allowed, for example to add a timestamp                                                                                    |
| batchSize          |    No    | int       | 1024          | Number of records fetched between the plugin and the database server per batch. Increasing it may cause Addax OOM or cause the target database transaction commit to fail and hang                                               |
| session            |    No    | list      | None          | Modifies session settings for local connections, see below for details                                                                                                                                                     |
| ddl                |    No    | string    | None          | DDL statement to create the target table; when the target table does not exist these DDL statements are executed to create it, and `@table` can be used to refer to the table involved                                      |

The generic RDBMS Writer only supports `insert`; `writeMode` is ignored even when configured. Use the database-specific Writer when you need `update` or `replace`.

### column

The set of column names to synchronize in the configured table, using a JSON array to describe field information. Users use `*` to represent using all column configurations by default, for example `["*"]`.

Column pruning is supported, i.e. only part of the columns can be selected for export.

Column reordering is supported, i.e. columns can be exported regardless of the table schema information.

Constant configuration is supported, in JSON format:

``["id", "`table`", "1", "'bazhen.csy'", "null", "to_char(a + 1)", "2.3" , "true"]``

- `id` is a normal column name
- `` `table` `` is a column name containing reserved words,
- `1` is an integer constant,
- `'bazhen.csy'` is a string constant
- `null` is a null pointer; note that `null` here must appear as a string, i.e. quoted with double quotes
- `to_char(a + 1)` is an expression,
- `2.3` is a floating point number,
- `true` is a boolean value; likewise, the boolean value here must also be quoted with double quotes

::: important
`column` must be filled in explicitly and is not allowed to be empty.
:::

### connection.jdbcUrl

In addition to the necessary information, `jdbcUrl` can also include specific configuration attributes for each particular driver. Here we especially note that these configuration attributes can be used to support proxies, thereby accessing the database through a proxy.
For example, the JDBC driver for the PrestoSQL database supports the `socksProxy` parameter, so a possible `jdbcUrl` is

`jdbc:presto://127.0.0.1:8080/hive?socksProxy=192.168.1.101:1081`

Most relational database JDBC drivers support the `socksProxyHost,socksProxyPort` parameters for proxy access. There are also some special cases.

The following are the proxy types and configuration methods supported by the JDBC drivers of various databases:

| Database | Proxy Type | Proxy Configuration           | Example                                            |
| -------- | ---------- | ----------------------------- | -------------------------------------------------- |
| MySQL    | socks      | socksProxyHost,socksProxyPort | `socksProxyHost=192.168.1.101&socksProxyPort=1081` |
| Presto   | socks      | socksProxy                    | `socksProxy=192.168.1.101:1081`                    |
| Presto   | http       | httpProxy                     | `httpProxy=192.168.1.101:3128`                     |

### connection.driver

In most cases, the JDBC driver of a database is fixed, but for some databases the recommended driver class name differs between versions, for example MySQL.
The new MySQL JDBC driver type recommends `com.mysql.cj.jdbc.Driver` instead of the previous `com.mysql.jdbc.Driver`.
If you want to use the old driver name, configure `connection.driver`; the generic RDBMS Writer must configure this item. The top-level `driver` is a deprecated legacy form that is still accepted but logs a deprecation warning.

### session

Description: Sets the session information when connecting to the database. For example, for an Oracle database, you can configure it as follows:

```json
{
  "session": [
    "alter session set nls_date_format = 'dd.mm.yyyy hh24:mi:ss';",
    "alter session set NLS_LANG = 'AMERICAN';"
  ]
}
```

### ddl

Used to execute statements before acquiring the target table, mainly for scenarios where the target table does not exist, for example:

```json
{
  "ddl": "CREATE TABLE IF NOT EXISTS @table (id INT PRIMARY KEY, name VARCHAR(100), age INT);"
}
```

In this way, the target table can be created before writing table data. If the target table already exists, the statement is not executed.
