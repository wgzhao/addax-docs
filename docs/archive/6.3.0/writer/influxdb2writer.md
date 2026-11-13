# InfluxDB2 Writer

InfluxDB2 Writer 插件实现了将数据写入 [InfluxDB](https://www.influxdata.com) 2.0 及以上版本的数据库的功能。

注意，InfluxDB 1.8 及以下版本的支持已在 6.0.11 版本移除，本插件仅支持 InfluxDB 2.0 及以上版本。

## 示例

以下示例用来演示该插件从内存读取数据并写入到指定表

### 创建 job 文件

创建 `job/stream2influx2.json` 文件，内容如下：

<<<@/public/assets/jobs/stream2influx2.json

### 运行

执行下面的命令进行数据采集

```bash
bin/addax.sh job/stream2influx2.json
```

## 参数说明

| 配置项     | 是否必须 | 数据类型    | 默认值 | 描述                                             |
| :--------- | :------: | ----------- | ------ | ------------------------------------------------ |
| endpoint   |    是    | string      | 无     | InfluxDB 连接串                                  |
| table      |    是    | string      | 无     | 要写入的表（指标）                               |
| org        |    是    | string      | 无     | 指定 InfluxDB 的 org 名称                        |
| bucket     |    是    | string      | 无     | 指定 InfluxDB 的 bucket 名称                     |
| token      |    是    | string      | 无     | 访问数据库的 token                               |
| column     |    是    | list        | 无     | 所配置的表中需要同步的列名集合，详细描述见下文   |
| tag        |    否    | `list<map>` | 无     | 所有记录共用的 tag，值为常量                     |
| tagColumns |    否    | list        | 无     | 值来自列的 tag，取值必须是 `column` 中出现的列名 |
| interval   |    否    | string      | ms     | 时间精度，可以取 `s`、`ms`、`us`、`ns`           |
| batchSize  |    否    | int         | 2048   | 单次 HTTP 请求写入的点数                         |

### column

InfluxDB 作为时序数据库，需要每条记录都有时间戳字段，因此会把每条记录的第一个字段当作时间戳来处理，
`column` 只需要指定除第一个字段外的其他字段，比如示例中 `streamreader` 设置了 4 个字段，
但 `influxdb2writer` 中的 `column` 只指定了三个字段，就是因为第一个字段已经默认作为时间戳了。

列名与记录按**位置**对应，不按列名匹配：`column` 的第 n 个名字对应记录的第 n+1 列。
因此记录的列数必须等于 `column` 的数量加一，列数不匹配时任务直接报错，避免写错字段或丢列。
`column` 必须显式配置，且列名不能重复，也不支持 `*`。

### tag

用于指定指标（这里当作表）的标签，每个 tag 使用 map 方式指定，比如示例中：

```json
{
  "tag": [
    {
      "location": "east"
    },
    {
      "lat": 23.123445
    }
  ]
}
```

map 中的 key 表示标签的名称，value 表示标签值。InfluxDB 的标签值本身就是字符串，因此这里的值会被转成
字符串写入，数字标签只能做等值匹配，示例中的 `23.123445` 会按字符串 `"23.123445"` 写入。
值必须是标量，写成 null 或者嵌套对象会直接报错。

tag 和 field 可以同名（InfluxDB 分开存储），同名时按名字分别写入。

### tagColumns

`tag` 的值是全局常量，无法表达"每一行的标签值不同"的场景。`tagColumns` 列出 `column` 中的列名，
这些列的**值**会作为同名 tag 写入而不是 field：

```json
{
  "column": ["host", "usage_user"],
  "tagColumns": ["host"]
}
```

这样 `host` 列的值会成为 tag，与 `influxdb2reader` 配合使用时可以保留源端的 tag 语义
（reader 把 tag 作为普通列输出，不加处理时会被 writer 当成 field 写入）。

列值为空时该 tag 不写入（这条记录仍然会写入，只是少一个 tag）。同一个名字同时出现在 `tag` 和
`tagColumns` 中时，以列值为准。

### interval

设置时间戳的间隔频率，该字段的定义来源于 [influxdb-client-java][1] 中的 [WritePrecision.java][2]，
其字符串表达的含义分别为：

- s : 秒
- ms : 毫秒
- us : 微秒
- ns : 纳秒

第一个字段（时间戳字段）支持以下类型：

- 时间戳类型（如 `TimestampColumn`、`DateColumn`）：直接取时间值
- 数值类型（`LongColumn`、`DoubleColumn`）：按 epoch 毫秒解释
- 字符串类型：依次按 `yyyy-MM-dd HH:mm:ss[.SSS]`（按 JVM 时区）、ISO-8601（可带时区，如
  `2026-09-30T10:00:00Z`）、epoch 毫秒尝试解析，都失败时报错并给出原始值

第一个字段为空时任务直接报错，因为 InfluxDB 的点必须有时间。

## 类型转换

| 来源列类型                    | 写入结果          | 说明                      |
| :---------------------------- | :---------------- | :------------------------ |
| LONG                          | integer           |                           |
| DOUBLE                        | float             | NaN/Infinity 不写入该字段 |
| BOOL                          | boolean           |                           |
| 非第一个字段的 DATE/TIMESTAMP | 字符串（RFC3339） | 如 `2026-09-30T10:00:00Z` |
| STRING/BYTES 及其他           | 字符串            |                           |
| 空值                          | 跳过该字段        | InfluxDB 没有 null        |

一条记录的所有字段都为空时，这个点无法在 InfluxDB 中表示，会被跳过，任务结束时会输出一条 WARN
说明跳过的条数。

## 行为说明

- 写入失败（网络异常、401、404、413、422 等）会让任务直接失败并给出失败的点数和 bucket，
  不会出现"服务端没写入但作业成功"的情况
- `batchSize` 是单次 HTTP 请求的点数，请求体默认启用 gzip 压缩
- `setting.speed.channel` 大于 1 时，按 reader 的切片数并行写入，每个任务使用独立的连接
- 记录数为 0 时正常结束，不会发起任何写入请求

## 限制

1. 当前插件仅支持 2.0 及以上版本
2. 写入失败后不会自动重试，需要重跑作业。InfluxDB 的点写入是幂等的（measurement + tag + 时间相同
   即覆盖同一个点），所以重跑整个作业是安全的
3. 指标名（measurement）固定取 `table` 配置，不能按行取不同的指标；tag 只能来自 `tag` 常量或
   `tagColumns` 指定的列

[1]: https://github.com/influxdata/influxdb-client-java
[2]: https://github.com/influxdata/influxdb-client-java/blob/master/client/src/generated/java/com/influxdb/client/domain/WritePrecision.java
