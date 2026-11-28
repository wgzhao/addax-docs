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

Note: If a dedicated database writer plugin is already provided, it is recommended to use the dedicated plugin. If the database you need to write to does not have a dedicated plugin, consider using this generic plugin. Before use, you need to perform the following operations to run normally, otherwise exceptions will occur.

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
- [PostgreSQL](https://postgresql.org): `org.postgresql.Drive`

## Configuration

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
| column             |   Yes    | list      | None          | Collection of column names to be synchronized in the configured table; supports `*`, column pruning/reordering and constants                                                                                              |
| preSql             |    No    | list      | None          | SQL executed before the synchronization task, one statement is allowed, for example to clear old data; `@table` can be used to refer to the table                                                                         |
| postSql            |    No    | list      | None          | SQL executed after the synchronization task, one statement is allowed, for example to update a timestamp                                                                                                                  |
| batchSize          |    No    | int       | 1024          | Number of records fetched between the plugin and the database server per batch. Increasing it may cause Addax OOM or transaction commit failures on the target database                                                   |
| session            |    No    | list      | None          | Session settings applied to local connections                                                                                                                                                                             |
| ddl                |    No    | string    | None          | DDL used to create the target table when it does not exist; `@table` can be used to refer to the table                                                                                                                    |

The generic RDBMS Writer only supports `insert`; `writeMode` is ignored even when configured. Use the database-specific Writer when you need `update` or `replace`.
