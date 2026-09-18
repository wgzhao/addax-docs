# DuckDB Reader

DuckDB Reader 插件用于读取 [DuckDB](https://duckdb.org/) 数据库文件中的数据，它继承于 [RDBMS Reader](rdbmsreader)。

DuckDB 是嵌入式数据库，没有服务端进程，`jdbcUrl` 直接指向一个数据库文件。

## 示例

我们先用 DuckDB 创建一个示例数据库（也可以用 Python 的 `duckdb` 模块或 `duckdb` 命令行）：

```sql
$ duckdb /tmp/test.duckdb
D CREATE TABLE test(id INTEGER, name VARCHAR, salary DECIMAL(10,2));
D INSERT INTO test VALUES (1, 'foo', 12.13), (2, 'bar', 202.22);
D .quit
```

下面的配置是读取该表到终端的作业:

<<<@/public/assets/jobs/duckdbreader.json

将上述配置文件保存为 `job/duckdb2stream.json`

### 执行采集命令

执行以下命令进行数据采集

```bash
bin/addax.sh job/duckdb2stream.json
```

## 参数说明

该插件基于 [RDBMS Reader](rdbmsreader) 实现，因此可以参考 RDBMS Reader 的所有配置项。因为 DuckDB 连接无需账号密码，因此其他数据库读取插件需要配置的 `username`，`password` 在这里不需要。

除了 `table` 之外，也可以用 `querySql` 指定任意 SQL 来读取，例如直接读取文件：

```
"querySql": [
  "SELECT * FROM read_parquet('/data/*.parquet')",
  "SELECT * FROM read_csv_auto('/data/*.csv')"
]
```

由于 DuckDB 支持 `read_parquet`、`read_csv`、`read_json` 以及 `httpfs`、S3 等扩展，可以用这种方式直接读取这些文件，而不需要专门的读取插件。

## 连接配置

DuckDB 的连接选项以 `;` 分隔追加在 `jdbcUrl` 后面（注意不是 `?` 和 `&`）：

```
jdbc:duckdb:/data/test.duckdb;threads=4;memory_limit=4GB;temp_directory=/tmp
```

常用选项：

| 选项                 | 说明                                                 |
| -------------------- | ---------------------------------------------------- |
| `threads`            | 并行线程数，默认等于 CPU 核数                        |
| `memory_limit`       | 内存上限，例如 `4GB`                                 |
| `temp_directory`     | 溢写临时目录，超出 `memory_limit` 的数据会落到这里   |
| `access_mode`        | `READ_ONLY` / `READ_WRITE` / `AUTOMATIC`             |
| `jdbc_stream_results`| 结果集流式返回，插件已默认开启（见下）               |

### 同一文件的多个连接必须配置一致

DuckDB 驱动按文件的绝对路径缓存数据库实例（instance cache 默认开启），同一个 JVM 里指向同一个文件的连接会复用这一个实例。
而数据库级别的配置只由**第一个**建立实例的连接决定，后续连接如果要求不同的配置会直接报错：

```
Can't open a connection to same database file with a different configuration than existing connections
```

因此如果一个作业的 reader 和 writer 都指向同一个文件，两边的 `jdbcUrl` 选项必须写成完全一样。插件已经统一在两端追加了相同的 `jdbc_stream_results=true`，你自己追加的选项也要保持一致。

### 关于 channel

建议显式设置 `channel: 1`。DuckDB 没有 `splitPk` 分片能力，`channel` 大于 1 只会让同一个查询重复执行多遍；查询本身的并行度由 `threads` 选项控制，而不是靠增加连接数。

### 关于 BIGINT UNSIGNED、HUGEINT、DECIMAL 的精度

DuckDB 的 `HUGEINT`/`UHUGEINT` 是 128 位整数，`DECIMAL` 最高支持 38 位有效数字，这些值用 double 承载会丢失精度。本插件把它们按**字符串**读取，可以无损传递；如果要写回数值列，写入插件会再解析回数值类型。

### 关于 TIME 的文本输出

把 `TIME` 列写成文本时，显示值与库里的值可能相差若干小时。这是因为文本转换使用 `ColumnCast` 中可配置的 `common.column.timeZone`（默认 `GMT+8`），与读取时使用的 JVM 时区无关——其它 RDBMS 读取插件也是同样的行为。需要在文本输出中看到库里的原始值时，把作业的时区和该配置对齐即可。

## 类型转换

| DuckDB 数据类型              | Addax 内部类型 | 说明                                       |
| ---------------------------- | -------------- | ------------------------------------------ |
| BOOLEAN                      | Boolean        |                                            |
| TINYINT / SMALLINT / INTEGER | Long           |                                            |
| BIGINT                       | Long           |                                            |
| UTINYINT / USMALLINT / UINTEGER | Long        |                                            |
| UBIGINT                      | Long / String  | 超出 `Long` 范围时按字符串保留完整精度     |
| HUGEINT / UHUGEINT           | String         | 128 位整数，按字符串保证精度               |
| FLOAT / DOUBLE               | Double         |                                            |
| DECIMAL                      | String         | 按字符串保证精度                           |
| VARCHAR / ENUM               | String         |                                            |
| BLOB                         | Bytes          |                                            |
| DATE                         | Date           |                                            |
| TIME / TIME_NS               | Date           |                                            |
| TIMESTAMP(_S/_MS/_NS)        | Timestamp      |                                            |
| TIMESTAMP WITH TIME ZONE     | Timestamp      | 转换为对应的时间点                         |
| UUID / JSON / INTERVAL       | String         | 驱动的文本表示                             |
| BIT                          | String         | 任意长度的位串，按 `0`/`1` 文本读取         |
| LIST / ARRAY / STRUCT / MAP / UNION | String  | 递归转换为 JSON 文本                       |

`LIST`、`STRUCT`、`MAP` 会转换成 JSON，例如 `[1,2,3]`、`{"a":1,"b":"x"}`、`{"p":1,"q":2}`。
