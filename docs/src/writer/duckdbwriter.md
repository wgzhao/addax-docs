# DuckDB Writer

DuckDB Writer 插件实现了写入数据到 [DuckDB](https://duckdb.org/) 数据库文件的功能。

DuckDB 是嵌入式数据库，没有服务端进程，`jdbcUrl` 直接指向一个数据库文件。

## 示例

假定要写入的表如下：

```sql
CREATE TABLE addax_tbl
(
    col1 VARCHAR,
    col2 INTEGER,
    col3 TIMESTAMP,
    col4 BOOLEAN,
    col5 BLOB
);
```

这里使用一份从内存产生到 DuckDB 的数据。

<<<@/public/assets/jobs/duckdbwriter.json

将上述配置文件保存为 `job/stream2duckdb.json`

### 执行采集命令

执行以下命令进行数据采集

```bash
bin/addax.sh job/stream2duckdb.json
```

## 参数说明

该插件基于 [RDBMS Writer](rdbmswriter) 实现，因此可以参考 RDBMS Writer 的所有配置项。因为 DuckDB 连接无需账号密码，因此其他数据库写入插件需要配置的 `username`，`password` 在这里不需要。

目标表必须**预先存在**，插件不会建表。注意 `preSql` 是在任务阶段才执行的，建表语句写在这里来不及——作业初始化时就要读取表的列元数据。

## 批量写入

DuckDB 提供了绕过 SQL 层的 `Appender` 接口，是官方推荐的批量载入方式。本插件在满足以下全部条件时自动使用它：

- `writeMode` 为 `insert`；
- 配置的 `column` 与表的物理列顺序完全一致；
- 所有目标列都是标量类型。

否则会自动退回普通的 `INSERT` 批量写入，并在日志中说明原因，例如：

```
Falling back to the prepared statement, the configured columns [name, id, qty] do not match the physical order [id, name, qty]
```

之所以要求列顺序一致，是因为 Appender 只能按表的物理顺序写入全部列，无法指定列子集或改变顺序；如果不做校验，顺序不一致时会**静默写错列**。

## 连接配置

DuckDB 的连接选项以 `;` 分隔追加在 `jdbcUrl` 后面（注意不是 `?` 和 `&`）：

```
jdbc:duckdb:/data/test.duckdb;threads=4;memory_limit=4GB;temp_directory=/tmp
```

### 同一文件的多个连接必须配置一致

DuckDB 驱动按文件的绝对路径缓存数据库实例，同一个 JVM 里指向同一个文件的连接会复用这一个实例，而数据库级别的配置只由**第一个**建立实例的连接决定。后续连接要求不同配置时会直接报错：

```
Can't open a connection to same database file with a different configuration than existing connections
```

因此如果一个作业的 reader 和 writer 都指向同一个文件，两边的 `jdbcUrl` 选项必须写成完全一样。

### 关于 channel

建议显式设置 `channel: 1`。DuckDB 对同一个文件同一时刻只允许一个写事务，多 channel 并发写入只会增加写冲突，并不会提升吞吐。

## writeMode

- `insert` 表示采用 `insert into`；
- `replace` 表示采用 `insert or replace into`，需要目标表有主键或唯一约束；
- `update(col1,col2...)` 表示采用 `insert ... on conflict (col1,col2...) do update set ...`。

`replace` 和 `update` 都不使用 Appender，走普通的批量写入。

## 类型转换

| Addax 内部类型         | DuckDB 数据类型                              |
| ---------------------- | -------------------------------------------- |
| Long                   | TINYINT / SMALLINT / INTEGER / BIGINT        |
| Double                 | FLOAT / DOUBLE                               |
| String                 | VARCHAR / 以及能被 DuckDB 隐式转换的其它类型 |
| String / Double / Long | DECIMAL                                      |
| Date                   | DATE / TIME / TIMESTAMP                      |
| Boolean                | BOOLEAN                                      |
| Bytes                  | BLOB                                         |

Appender 按**目标列的 DuckDB 类型**分派取值：整数列走 `asLong()`、浮点列走 `asDouble()`、DECIMAL 列走 `asBigDecimal()`、文本列走 `asString()`，因此 DECIMAL 目标列不管来源是文本还是数值都能精确落库。

`LIST`、`STRUCT`、`MAP`、`UNION` 等嵌套类型以及 `GEOMETRY` 暂不支持作为写入目标列，遇到时会报错。
