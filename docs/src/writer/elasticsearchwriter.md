# ElasticSearch Writer

ElasticSearch Writer 插件用于向 [ElasticSearch](https://www.elastic.co/cn/elastic-stack/) 写入数据。
其实现是通过 elasticsearch 的 rest api 接口， 批量把据写入 elasticsearch

## 前置条件

Elasticsearch 7.0 及以上。Elasticsearch 从 7.0 起移除了 mapping type：索引连同
settings 和 mappings 一次创建，已存在索引的 mappings 通过 `/{index}/_mapping`
更新，不再有 `type` 参数。

## 配置样例

<<<@/public/assets/jobs/eswriter.json

## 参数说明

| 配置项           | 是否必须 | 数据类型    | 默认值 | 描述                                                                  |
| :--------------- | :------: | ----------- | ------ | --------------------------------------------------------------------- |
| endpoint         |    是    | string      | 无     | ElasticSearch 的连接地址,如果是集群，则多个地址用逗号(,)分割          |
| accessId         |    否    | string      | 空     | http auth 中的 user, 默认为空                                         |
| accessKey        |    否    | string      | 空     | http auth 中的 password                                               |
| index            |    是    | string      | 无     | index 名                                                              |
| cleanup          |    否    | boolean     | false  | 是否删除原表                                                          |
| batchSize        |    否    | int         | 1000   | 每次批量数据的条数                                                    |
| trySize          |    否    | int         | 30     | 失败后重试的次数                                                      |
| timeout          |    否    | int         | 600000 | 客户端超时时间，单位为毫秒(ms)                                        |
| discovery        |    否    | boolean     | false  | 启用节点发现将(轮询)并定期更新客户机中的服务器列表                    |
| compression      |    否    | boolean     | true   | 否是开启 http 请求压缩                                                |
| multiThread      |    否    | boolean     | true   | 是否开启多线程 http 请求                                              |
| ignoreWriteError |    否    | boolean     | false  | 重试完所有次数仍失败的批次，为 `true` 时打日志跳过，否则任务失败      |
| ignoreParseError |    否    | boolean     | true   | 解析数据格式错误时，是否继续写入                                      |
| alias            |    否    | string      | 无     | 数据导入完成后写入别名                                                |
| aliasMode        |    否    | string      | append | 数据导入完成后增加别名的模式，append(增加模式), exclusive(只留这一个) |
| settings         |    否    | map         | 无     | 创建 index 时候的 settings, 与 elasticsearch 官方相同                 |
| splitter         |    否    | string      | `,`    | 如果插入数据是 array，就使用指定分隔符                                |
| column           |    是    | `list<map>` | 无     | 文档的字段，见下文                                                    |
| dynamic          |    否    | boolean     | false  | 不使用 addax 的 mappings，使用 es 自己的自动 mappings                 |

### column

每个条目对应文档的一个字段，与 reader 的列**按位置一一对应**，两者条目数必须相同。

| 键                              | 说明                                                                                                                                                                             |
| :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name                            | 字段名。名为 `pk` 的列作为文档 id，而不是字段（见下方约束）                                                                                                                      |
| type                            | 字段类型：`keyword`、`text`、`long`、`integer`、`short`、`byte`、`double`、`float`、`date`、`boolean`、`binary`、`ip`、`object`、`nested`、`flattened`、`geo_point`、`geo_shape` |
| array                           | 为 `true` 时该列是一个字符串，其中按 `splitter` 存放数组的各个元素                                                                                                               |
| format、timezone                | `date` 字段：如何解析传入的文本、按哪个时区解释；写入 elasticsearch 的值是 ISO-8601 格式                                                                                         |
| analyzer、norms、index_options  | `text` 字段：elasticsearch 自身的参数，`index_options` 取值 `docs`、`freqs`、`positions`、`offsets`                                                                              |
| doc_values、index、ignore_above | 与 elasticsearch 官方一致                                                                                                                                                        |
| eager_global_ordinals           | `keyword` 字段                                                                                                                                                                   |

`geo_shape` 的 `tree` 和 `precision` 属于 elasticsearch 6 已用 BKD 树替代的四叉树实现，
现在会被忽略并打印警告。

### batchSize

单次 bulk 请求的文档数，是对任务耗时影响最大的一个参数：20 万条 250 字节的文档写入单节点，
默认 1000 用时 12 秒，改成 5000 用时 6 秒（均为单 channel），因为一次 bulk 请求无论多大都要一次往返。
elasticsearch 建议单次 bulk 控制在 5~15MB，文档较大时应调小该值。

## 约束限制

- 如果导入 id，这样数据导入失败也会重试，重新导入也仅仅是覆盖，保证数据一致性
- 如果不导入 id，就是 append_only 模式，elasticsearch 自动生成 id，速度会提升 20%左右，但数据无法修复，适合日志型数据(对数据精度要求不高的)
- `pk` 列没有值的记录会不带 id 写入，由 elasticsearch 生成 id，并打印一条警告。此前这类记录会以字面量 `null` 作为文档 id，多条这样的记录会互相覆盖
- 别名在数据写完后设置；设置失败时任务会失败。此前只打日志、任务仍报成功，导致按别名读取的下游继续读到旧索引
