# RDBMS Writer

RDBMS Writer 插件支持向传统 RDBMS 写入数据。这是一个通用关系数据库写入插件，可以通过注册数据库驱动等方式支持更多关系数据库写入。

同时 RDBMS Writer 又是其他关系型数据库写入插件的基础类。以下写入插件均依赖该插件

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

注意, 如果已经提供了专门的数据库写入插件的，推荐使用专用插件，如果你需要写入的数据库没有专门插件，则考虑使用该通用插件。 在使用之前，还需要执行以下操作才可以正常运行，否则运行会出现异常。

## 配置驱动

假定你需要写入 IBM DB2 的数据，因为没有提供专门的读取插件，所以我们可以使用该插件来实现，在使用之前，需要执行下面两个操作：

1. 下载对应的 JDBC 驱动，并拷贝到 `plugin/writer/rdbmswriter/libs` 目录
2. 修改任务配置文件，在 `writer.parameter.connection.driver` 中填写正确的 JDBC 驱动名，比如 DB2 的驱动名为 `com.ibm.db2.jcc.DB2Driver`；旧写法 `writer.parameter.driver` 仍然兼容，但会打印弃用警告

以下列出常见的数据库以及对应的驱动名称

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

## 配置说明

配置一个写入RDBMS的作业。

<<<@/public/assets/jobs/rdbmswriter.json

## 参数说明

下表中的配置路径以 `writer.parameter` 为根。`connection` 既可以写成对象，也可以写成只包含一个元素的数组；写成多元素数组时只有第一个元素生效。

### 配置结构

<!--@include: @/src/_partials/writer/rdbms-structure.md#base -->

上图只表示配置层级，是否必填、数据类型和默认值见下表。

| 配置路径           | 是否必须 | 数据类型 | 默认值 | 描述                                                                                                                                          |
| :----------------- | :------: | -------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| connection         |    是    | object   | 无     | 连接信息，子项见下；可写成对象，也可写成只包含一个元素的数组                                                                                  |
| connection.jdbcUrl |    是    | string   | 无     | 对端数据库的 JDBC 连接信息，jdbcUrl 按照 RDBMS 官方规范，并可以填写连接附件控制信息                                                           |
| connection.table   |    是    | list     | 无     | 所选取的需要同步的表名，使用 JSON 数据格式；配置为多张表时，用户需自行保证多张表是同一表结构                                                  |
| connection.driver  |    是    | string   | 无     | 自定义驱动类名，通用 RDBMS Writer 必须配置；顶层 `driver` 是已弃用的旧写法，仍兼容但会打印弃用警告；两者同时配置时以 `connection.driver` 为准 |
| username           |    是    | string   | 无     | 数据源的用户名                                                                                                                                |
| password           |    否    | string   | 无     | 数据源指定用户名的密码                                                                                                                        |
| column             |    是    | list     | 无     | 所配置的表中需要同步的列名集合，详细描述见后                                                                                                  |
| preSql             |    否    | list     | 无     | 执行数据同步任务之前率先执行的 SQL 语句，目前只允许执行一条 SQL 语句，例如清除旧数据，涉及到的表可用 `@table` 表示                            |
| postSql            |    否    | list     | 无     | 执行数据同步任务之后执行的 SQL 语句，目前只允许执行一条 SQL 语句，例如加上某一个时间戳                                                        |
| batchSize          |    否    | int      | 1024   | 定义了插件和数据库服务器端每次批量数据获取条数，调高该值可能导致 Addax 出现 OOM 或者目标数据库事务提交失败导致挂起                            |
| session            |    否    | list     | 无     | 针对本地连接，修改会话配置，详见下文                                                                                                          |
| ddl                |    否    | string   | 无     | 目标端建表 DDL 语句，当目标表不存在时会执行这些 DDL 语句创建表，涉及到的表可用 `@table` 表示                                                  |

通用 RDBMS Writer 只支持 `insert` 写入方式；即使配置了 `writeMode` 也会被忽略。需要 `update` 或 `replace` 时，请使用对应数据库的专用 Writer。

### column

所配置的表中需要同步的列名集合，使用JSON的数组描述字段信息。用户使用 `*` 代表默认使用所有列配置，例如 `["*"]`。

支持列裁剪，即列可以挑选部分列进行导出。

支持列换序，即列可以不按照表schema信息进行导出。

支持常量配置，用户需要按照JSON格式:

``["id", "`table`", "1", "'bazhen.csy'", "null", "to_char(a + 1)", "2.3" , "true"]``

- `id` 为普通列名
- `` `table` `` 为包含保留在的列名，
- `1` 为整形数字常量，
- `'bazhen.csy'`为字符串常量
- `null` 为空指针，注意，这里的 `null` 必须以字符串形式出现，即用双引号引用
- `to_char(a + 1)`为表达式，
- `2.3` 为浮点数，
- `true` 为布尔值，同样的，这里的布尔值也必须用双引号引用

Column必须显示填写，不允许为空！

### connection.jdbcUrl

`jdbcUrl` 除了配置必要的信息外，我们还可以再增加每种特定驱动的特定配置属性，这里特别提到我们可以利用配置属性对代理的支持从而实现通过代理访问数据库的功能。
比如对于 PrestoSQL 数据库的 JDBC 驱动而言，支持 `socksProxy` 参数，比如一个可能的 `jdbcUrl` 为

`jdbc:presto://127.0.0.1:8080/hive?socksProxy=192.168.1.101:1081`

大部分关系型数据库的 JDBC 驱动支持 `socksProxyHost,socksProxyPort` 参数来支持代理访问。也有一些特别的情况。

以下是各类数据库 JDBC 驱动所支持的代理类型以及配置方式

| 数据库 | 代理类型 | 代理配置                      | 例子                                               |
| ------ | -------- | ----------------------------- | -------------------------------------------------- |
| MySQL  | socks    | socksProxyHost,socksProxyPort | `socksProxyHost=192.168.1.101&socksProxyPort=1081` |
| Presto | socks    | socksProxy                    | `socksProxy=192.168.1.101:1081`                    |
| Presto | http     | httpProxy                     | `httpProxy=192.168.1.101:3128`                     |

### connection.driver

大部分情况下，一个数据库的 JDBC 驱动是固定的，但有些因为版本的不同，所建议的驱动类名不同，比如 MySQL。
新的 MySQL JDBC 驱动类型推荐使用 `com.mysql.cj.jdbc.Driver` 而不是以前的 `com.mysql.jdbc.Driver`。
如果想要使用旧的驱动名称，则配置 `connection.driver`；通用 RDBMS Writer 必须配置这一项。顶层 `driver` 是已弃用的旧写法，仍兼容但会打印弃用警告。

### session

描述：设置数据库连接时的session信息，比如针对 Oracle 数据库，可以设置如下：

```json
{
  "session": [
    "alter session set nls_date_format = 'dd.mm.yyyy hh24:mi:ss';",
    "alter session set NLS_LANG = 'AMERICAN';"
  ]
}
```

### ddl

用来在获取目标表之前执行的语句，主要是考虑那些目标表不存在的场景，比如：

```json
{
  "ddl": "CREATE TABLE IF NOT EXISTS @table (id INT PRIMARY KEY, name VARCHAR(100), age INT);"
}
```

这样，就可以在写入表数据之前，先创建目标表。如果目标表已经存在，则不会执行该语句。
