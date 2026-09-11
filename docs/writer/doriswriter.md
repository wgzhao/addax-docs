# Doris Writer

DorisWriter 插件用于向 [Doris](http://doris.incubator.apache.org/master/zh-CN/) 数据库以流式方式写入数据。 其实现上是通过访问
Doris http 连接(8030)，然后通过 [stream load](http://doris.incubator.apache.org/master/zh-CN/administrator-guide/load-data/stream-load-manual.html)
加载数据到数据中，相比 `insert into` 方式效率要高不少，也是官方推荐的生产环境下的数据加载方式。

Doris 是一个兼容 MySQL 协议的数据库后端，因此 Doris 读取可以使用 [MySQL Reader](../reader/mysqlreader) 进行访问。

## 示例

假定要写入的表的建表语句如下：

```sql
CREATE DATABASE example_db;
CREATE TABLE example_db.table1
(
  siteid INT DEFAULT '10',
  citycode SMALLINT,
  username VARCHAR(32) DEFAULT '',
  pv BIGINT SUM DEFAULT '0'
) AGGREGATE KEY(siteid, citycode, username)
DISTRIBUTED BY HASH(siteid) BUCKETS 10
PROPERTIES("replication_num" = "1");
```

下面配置一个从内存读取数据，然后写入到 doris 表的配置文件

<<<@/public/assets/jobs/doriswriter.json

将上述配置文件保存为 `job/stream2doris.json`

执行下面的命令

```bash
bin/addax.sh job/stream2doris.json
```

输出类似如下：

:::details
<<<@/public/assets/output/doriswriter.txt
:::

## 参数说明

| 配置项                   | 是否必须 | 类型   | 默认值   | 描述                                                               |
| :----------------------- | :------: | ------ | -------- | ------------------------------------------------------------------ |
| loadUrl                  |    是    | string | 无       | Stream Load 的连接目标 ｜                                          |
| username                 |    是    | string | 无       | 访问Doris数据库的用户名                                            |
| password                 |    否    | string | 无       | 访问Doris数据库的密码                                              |
| flushInterval            |    否    | int    | 3000     | 数据写入到目标表的间隔时间，单位为毫秒，即每隔多少毫秒写入一次数据 |
| flushQueueLength         |    否    | int    | 1        | 上传数据的队列长度                                                 |
| table                    |    是    | List   | 无       | 所选取的需要同步的表名                                             |
| column                   |    是    | list   | 无       | 所配置的表中需要同步的列名集合，详细描述见 [RBDMS Writer][1]       |
| maxBatchRows             |    否    | int    | 100000   | 每批次导入数据的最大行数，与 `maxBatchSize` 满足其一即触发写入     |
| maxBatchSize             |    否    | long   | 52428800 | 每批次导入数据的最大字节数，默认 50MB                              |
| batchSize                |    否    | int    | 无       | 已废弃，含义等同于 `maxBatchRows`，仅为兼容旧作业保留              |
| connectTimeout           |    否    | int    | 5000     | 建立连接的超时时间，单位为毫秒                                     |
| socketTimeout            |    否    | int    | 600000   | 等待响应的超时时间，单位为毫秒，应能覆盖一个最大批次的写入耗时     |
| connectionRequestTimeout |    否    | int    | 5000     | 从连接池获取连接的超时时间，单位为毫秒                             |
| hostCooldownMs           |    否    | int    | 30000    | 某 `loadUrl` 写入失败后被跳过的时长，单位为毫秒                    |
| loadProps                |    否    | map    | `csv`    | streamLoad 的请求参数，详情参照[StreamLoad介绍页面][2]             |
| preSql                   |    否    | list   |          | 写入数据到目标表前要执行的 SQL 语句                                |
| postSql                  |    否    | list   |          | 数据写完后要执行的 SQL 语句                                        |

[1]: ./rdbmswriter
[2]: https://github.com/apache/doris-streamloader/tree/master

## loadUrl

作为 Stream Load 的连接目标。格式为 "ip:port"。其中 IP 是 FE 节点 IP，port 是 FE 节点的 http_port；也接受带 `http://` 或 `https://` 前缀的写法。

可以填写多个，此时插件按轮询顺序选择 FE 节点；如果某个节点写入失败，它会在 `hostCooldownMs`（默认 30 秒）内被跳过，避免后续批次继续往故障节点上打。当所有节点都处于冷却期时，插件仍会按轮询结果发起请求，由批次级重试换用其它节点，而不是直接失败。

### column

允许配置为 `["*"]` ， 如果是 "\*" , 则尝试从 Doris 数据库中直接读取表字段，然后进行拼装。

### loadProps

StreamLoad 的请求参数，详情参照StreamLoad介绍页面。[Stream load - Apache Doris](https://doris.apache.org/zh-CN/docs/data-operate/import/import-way/stream-load-manual)

这里包括导入的数据格式：format等，导入数据格式默认我们使用csv，支持JSON，具体可以参照下面类型转换部分，也可以参照上面Stream load 官方信息

## 类型转换

默认传入的数据均会被转为字符串，并以 `\t` 作为列分隔符，`\n` 作为行分隔符，组成 csv 文件进行 StreamLoad 导入操作。

默认是 csv 格式导入，如需更改列分隔符， 则正确配置 loadProps 即可

```json
{
  "loadProps": {
    "column_separator": "\\x01",
    "line_delimiter": "\\x02"
  }
}
```

如需更改导入格式为json， 则正确配置 loadProps 即可：

```json
{
  "loadProps": {
    "format": "json",
    "strip_outer_array": true
  }
}
```

注意：CSV 模式下插件不对字段内容做转义，如果字段本身就含有列分隔符（默认 `\t`）或换行符，导入结果会错乱。这类数据建议使用 `format: json`，或者在上游先替换掉特殊字符。

## 性能调优

Stream Load 每提交一次就会在 Doris 中产生一个导入事务，批次过小会产生大量小事务，带来额外的版本数和 Compaction 压力，因此批次大小是写入效率最关键的因素。插件按 `maxBatchRows` 和 `maxBatchSize` 中先满足的条件切分批次，默认 10 万行 / 50MB，通常无需调整。

调优建议：

- 宽表或单行较大的场景优先调大 `maxBatchSize`（例如 100MB~200MB），窄表优先调大 `maxBatchRows`；
- `flushInterval` 决定攒批的最长时间。写入速率低、又要求低延迟时调小；写入速率高时批次大小会先触发，可以适当调大以让每批更大；
- `flushQueueLength` 决定等待上传的批次队列长度，同时也决定内存占用（大致为（队列长度 + 1）× 每批字节数），内存紧张时保持默认值 1；
- 每个 Task 复用同一个 HTTP 连接池，不会为每个批次重新建连；内网环境可以将 `connectTimeout` 调小，`socketTimeout` 需要覆盖最大批次的写入耗时，否则大批次可能被误判为超时；
- 写入过程中可以观察日志里的 `rows[]`、`bytes[]`，确认实际批次大小是否符合预期。
