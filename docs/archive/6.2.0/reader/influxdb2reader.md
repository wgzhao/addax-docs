# InfluxDB2 Reader

InfluxDB2 Reader 插件实现了从 [InfluxDB](https://www.influxdata.com) 2.0 及以上版本读取数据。

注意，InfluxDB 1.8 及以下版本的支持已在 6.0.11 版本移除，本插件仅支持 InfluxDB 2.0 及以上版本。

## 示例

以下示例用来演示该插件如何从指定表(即指标)上读取数据并输出到终端

### 创建 job 文件

创建 `job/influx2stream.json` 文件，内容如下：

<<<@/public/assets/jobs/influx2stream.json

### 运行

执行下面的命令进行数据采集

```bash
bin/addax.sh job/influx2stream.json
```

## 参数说明

| 配置项   | 是否必须 | 数据类型 | 默认值 | 描述                                                           |
| :------- | :------: | -------- | ------ | -------------------------------------------------------------- |
| endpoint |    是    | string   | 无     | InfluxDB 连接串 ｜                                             |
| token    |    是    | string   | 无     | 访问数据库的 token                                             |
| table    |    否    | list     | 无     | 所选取的需要同步的表名(即指标)，不配置时读取 bucket 下所有指标 |
| org      |    是    | string   | 无     | 指定 InfluxDB 的 org 名称                                      |
| bucket   |    是    | string   | 无     | 指定 InfluxDB 的 bucket 名称                                   |
| column   |    否    | list     | 无     | 所配置的表中需要同步的列名集合，详细描述见下文                 |
| range    |    是    | list     | 无     | 读取数据的时间范围                                             |
| limit    |    否    | int      | 无     | 限制获取记录数，每个指标 + tag 组合各取 N 条，详见下文         |

### column

列名由 InfluxDB 的索引解析得到，与写入时间无关，因此时间范围内没有数据时也能确定列。

- 不指定 `column`，或者指定 `column` 为 `["*"]` 时，读取 `_time`、所有 tag 列以及所有 field 列；当 `table` 配置了多个指标时，还会带上 `_measurement` 列用于区分数据来源
- 显式指定 `column` 时，只有包含这些字段的记录才会被读取，因此某个指标缺少指定字段时，该指标下不包含这些字段的记录不会返回
- 指定的列不存在时，插件直接报错并列出可用的列名

### range

`range` 用来指定读取指标的时间范围，其格式如下:

```json
{
  "range": ["start_time", "end_time"]
}
```

`range` 由一至两个字符串组成的列表组成，第一个字符串表示开始时间，必须指定；第二个表示结束时间，可以省略。其时间表达方式要求符合 [Flux 格式要求][2],类似这样:

```json
{
  "range": ["-15h", "-2h"]
}
```

其中第二个结束时间如果不想指定，可以不写，类似这样：

```json
{
  "range": ["-15h"]
}
```

`range` 里写的是 Flux 的时间字面量，相对时间（如 `-15h`）和绝对时间（如 `2018-11-01T00:00:00Z`）都可以，**但绝对时间不能加引号**，写成 `"2018-11-01T00:00:00Z"` 会被 InfluxDB 拒绝。

## 类型转换

| InfluxDB 类型     | 转换后的类型 |
| :---------------- | :----------- |
| long/unsignedLong | 整型         |
| double            | 浮点         |
| boolean           | 布尔         |
| dateTime          | 时间戳       |
| 其他(含 string)   | 字符串       |
| 空值              | NULL         |

## 行为说明

- `range` 范围内没有任何数据时，任务正常结束，读取 0 条记录
- 指定的 `table` 或 `column` 在 bucket 中不存在时，任务直接报错，并给出现有指标/列名

## 限制

1. 当前插件仅支持 2.0 及以上版本
2. `limit` 采用 Flux 的 `limit()` 语义，是**每个指标 + tag 组合**各取 N 条，不是全局 N 条
3. `setting.speed.channel` 对该插件无效，读取始终由单个任务完成

[2]: https://docs.influxdata.com/influxdb/v2.0/query-data/flux/
