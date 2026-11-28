# IoTDB Reader

IoTDB Reader 插件用于从 [Apache IoTDB](https://iotdb.apache.org) 读取时序数据，支持 tree model 和 2.x 引入的 table model。

## 配置样例

以下示例从 tree model 读取一个设备的两个测点，并打印到终端：

<<<@/public/assets/jobs/iotdbreader.json

将上述配置文件保存为 `job/iotdb2stream.json`，执行：

```bash
bin/addax.sh job/iotdb2stream.json
```

## 参数说明

下表中的配置路径以 `reader.parameter` 为根。`connection` 既可以写成对象，也可以写成只包含一个元素的数组；写成多元素数组时只有第一个元素生效。

### 配置结构

```text
parameter
├─ connection
│  ├─ jdbcUrl
│  └─ querySql
├─ username
├─ password
├─ sqlDialect
├─ device
├─ measurements
├─ where
├─ timeColumnPosition
├─ fetchSize
├─ table
├─ column
├─ beginDateTime
├─ endDateTime
└─ splitInterval
```

上图只表示配置层级，是否必填、数据类型和默认值见下表。

| 配置路径            |     是否必须      | 类型   | 默认值  | 描述                                                                                                                           |
| :------------------ | :---------------: | ------ | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| connection          |        是         | object | 无      | 连接信息，子项见下；可写成对象，也可写成只包含一个元素的数组                                                                   |
| connection.jdbcUrl  |        是         | string | 无      | JDBC 连接串，例如 `jdbc:iotdb://127.0.0.1:6667/`                                                                               |
| connection.querySql |        否         | list   | 无      | 自定义 SQL 列表，每个 SQL 生成一个读取任务                                                                                     |
| username            |        是         | string | 无      | IoTDB 用户名                                                                                                                   |
| password            |        否         | string | 无      | IoTDB 密码                                                                                                                     |
| sqlDialect          |        否         | string | tree    | `tree` 或 `table`；未配置时从 `connection.jdbcUrl` 中的 `sql_dialect` 推断                                                     |
| device              |        是         | string | 无      | tree model 的设备路径，例如 `root.factory.device1`；配置 `connection.querySql` 时可不配置                                      |
| measurements        |        是         | list   | 无      | tree model 的测点名列表，或 `["*"]`；配置 `connection.querySql` 时可不配置                                                     |
| where               |        否         | string | 无      | 时间或测点过滤条件                                                                                                             |
| timeColumnPosition  |        否         | int    | 0       | tree model 中隐式 time 列在输出记录中的位置                                                                                    |
| fetchSize           |        否         | int    | 10000   | JDBC 每次获取的记录数                                                                                                          |
| table               | 是（table model） | string | 无      | table model 的表名，格式为 `database.table`；配置 `connection.querySql` 时可不配置；也接受写在 `connection.table` 下，顶层优先 |
| column              |        否         | list   | `["*"]` | table model 读取的列名，不能与 `*` 混用；也接受写在 `connection.column` 下，顶层优先                                           |
| beginDateTime       |        否         | string | 无      | 时间切分起始时间（包含），格式 `yyyy-MM-dd HH:mm:ss` 或毫秒时间戳                                                              |
| endDateTime         |        否         | string | 无      | 时间切分结束时间（不包含），格式同上                                                                                           |
| splitInterval       |        否         | string | 无      | 时间切分粒度，例如 `1d`、`6h`、`30m`、`10s`、`500ms`                                                                           |

`beginDateTime`、`endDateTime`、`splitInterval` 必须同时配置；配置时间切分后不能再使用 `connection.querySql`，两者只能选其一。

## Tree model

tree model 的查询结果即使没有显式 `SELECT time`，也会在首列返回 time。插件会把这个隐式 time 列插入到 `timeColumnPosition` 指定的位置；默认 `0`，即输出记录的第一列是 time，后面依次是 `measurements`。

```json
{
  "device": "root.factory.device1",
  "measurements": ["temperature", "humidity"],
  "timeColumnPosition": 0
}
```

`measurements` 配置为 `["*"]` 时读取设备下的全部测点。设备下的测点集合可能随时间变化，生产任务建议显式列出测点。

### 使用 connection.querySql 并行读取

`querySql` 适合按时间范围或设备手工拆分并行读取，每个 SQL 生成一个 task：

```json
{
  "connection": {
    "jdbcUrl": "jdbc:iotdb://127.0.0.1:6667/",
    "querySql": [
      "SELECT s1,s2 FROM root.demo.d1 WHERE time >= 0 AND time < 2000",
      "SELECT s1,s2 FROM root.demo.d1 WHERE time >= 2000 AND time < 4000"
    ]
  },
  "timeColumnPosition": 0
}
```

`querySql` 非空时，`device`、`measurements`、`where` 和三个时间切分参数都会被忽略，SQL 由用户完全控制。

### 时间区间切分

不写 `connection.querySql` 时，可以按时间区间自动切分。插件为每个区间生成
`WHERE (where) AND time >= begin AND time < end` 条件：

```json
{
  "device": "root.demo.d1",
  "measurements": ["s1", "s2"],
  "beginDateTime": "2025-01-01 00:00:00",
  "endDateTime": "2025-01-02 00:00:00",
  "splitInterval": "1h"
}
```

`splitInterval` 的单位为 `d`（天）、`h`（小时）、`m`（分钟）、`s`（秒）、`ms`（毫秒）。
区间边界按运行任务的 JVM 默认时区解析。

## Table model

table model 使用标准 SQL，`table` 写 `database.table`，`column` 写需要读取的列。time 列是否返回取决于 `column` 中是否包含它，插件不会额外插入 time：

```json
{
  "sqlDialect": "table",
  "table": "demo.metrics",
  "column": ["time", "device_id", "temperature", "humidity"],
  "where": "time >= 1735689600000 AND time < 1735776000000"
}
```

table model 只存在于 IoTDB 2.x；连接 1.x server 时任务会在启动阶段报错并提示需要 2.x。

## 类型转换

| Addax 内部类型 | IoTDB 数据类型  |
| -------------- | --------------- |
| Long           | INT32, INT64    |
| Double         | FLOAT, DOUBLE   |
| String         | TEXT, STRING    |
| Boolean        | BOOLEAN         |
| Date/Timestamp | TIMESTAMP, DATE |
| Bytes          | BLOB            |

## 当前支持版本

- IoTDB 2.x：tree model 和 table model。
- IoTDB 1.3.7 及以上：仅 tree model，best effort；插件使用 2.0.x client，厂商不保证新客户端连接旧服务端。
- IoTDB 1.0–1.2：不支持。

## 注意事项

- 时间按毫秒处理，这与 IoTDB 默认精度一致；配置为微秒或纳秒精度的 server 暂不支持。
- 一个 job 只支持一个连接；`connection` 可以写成对象，也可以写成长度为 1 的数组。
- tree model 的聚合查询如果不返回 time 列，插件会按普通结果集处理，不会额外插入 time。
