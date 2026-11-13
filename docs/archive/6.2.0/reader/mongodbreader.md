# MongoDB Reader

MongoDBReader 插件利用 MongoDB 的java客户端MongoClient进行MongoDB的读操作。

## 配置样例

该示例从MongoDB中读一张表并打印到终端

<<<@/public/assets/jobs/mongoreader.json

## 参数说明

| 配置项     | 是否必须 | 类型          | 默认值 | 描述                                        |
| :--------- | :------: | ------------- | ------ | ------------------------------------------- |
| address    |    是    | list          | 无     | MongoDB 的数据地址信息, 可写多个            |
| username   |    否    | string        | 无     | MongoDB 用户名                              |
| password   |    否    | string        | 无     | MongoDB 密码                                |
| database   |    是    | string        | 无     | MongoDB 数据库                              |
| collection |    是    | string        | 无     | MongoDB 的集合名，支持单值或范围通配符      |
| column     |    是    | list          | 无     | MongoDB 的文档列名, 配置 `["*"]` 获取所有列 |
| query      |    否    | string/object | 无     | 自定义查询条件，详见下文                    |
| fetchSize  |    否    | int           | 2048   | 批量获取的记录数                            |

### collection

`collection` 仅支持字符串类型，支持以下两种写法：

- 单个集合：`collection`
- 范围通配符：`collection[0-9]`（展开为 `collection0` 到 `collection9`）

不支持混合模式（如 `collection[0-3],collection9`）。

当使用范围通配符时，如果部分集合不存在，会打印告警并跳过，不会中断整个任务。

### column

`column` 用来指定需要读取的字段名称，这里我们做了字段名称的组成两个假定：

- 不可能用单引号开头(`'`)
- 不可能全部由数字和点(`.`) 组成

基于以上假定，我们可以在简化 `column` 配置的同时，还可以指定一些常量作为补充字段，比如一般采集一张表，我们需要增加采集时间，采集源等常量，那么可以这样配置

```json
{
  "column": ["col1", "col2", "col3", "'source_mongodb'", "20211026", "123.12"]
}
```

上述配置的后三个字段就是常量，分别当作字符类型，整型和浮点型处理。

如果字段是嵌入式的，可以用点(`.`)来表示层级关系，比如：

```json
{
  "column": ["col1", "col2", "col3.subcol1", "col3.subcol2"]
}
```

同时配置某个字段和它下面的字段（如 `["col3", "col3.subcol1"]`）也是允许的，两者都能读到值。插件只按宽度更大的那个路径向服务端请求数据，窄路径的字段从已有的数据里取。

### query

`query` 用于过滤要读取的文档，可以写成扩展 JSON（extended JSON）字符串，也可以直接写成 JSON 对象：

```json
{
  "query": "{amount: {$gt: 140900}, oc_date: {$gt: 20190110}}"
}
```

```json
{
  "query": {
    "amount": {
      "$gt": 140900
    }
  }
}
```

上述查询类似 SQL 中的 `where amount > 140900 and oc_date > 20190110`

`query` 按**扩展 JSON** 解析，而不是按 JavaScript 解析，所以 mongosh 里能执行的 JS 写法在这里不一定成立，日期尤其要注意：

| 写法                                     | 结果                                                                                                                |
| :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------ |
| `new Date('2026-09-20')`                 | ✗ 报 `JSON reader expected a date in 'EEE MMM dd yyyy HH:mm:ss z' format`，字符串形式只认 Java 日期格式，不建议使用 |
| `new Date(1789833600000)`                | ✓ 毫秒数                                                                                                            |
| `ISODate('2026-09-20')`                  | ✓ 按**运行任务的 JVM 默认时区**解析为当天 0 点                                                                      |
| `ISODate('2026-09-20T00:00:00Z')`        | ✓ 按 UTC 解析                                                                                                       |
| `ISODate('2026-09-20T00:00:00+08:00')`   | ✗ 不接受时区偏移                                                                                                    |
| `{"$date": "2026-09-20T00:00:00+08:00"}` | ✓ 时区明确，推荐                                                                                                    |
| `{"$date": 1789833600000}`               | ✓ 毫秒数，推荐                                                                                                      |

需要注意，mongosh 中的 `new Date('2026-09-20')` 按 UTC 解析，而这里的 `ISODate('2026-09-20')` 按运行任务的 JVM 默认时区解析，两者相差一个时区偏移。需要跨环境结果一致时，请使用带时区偏移的 `{"$date": ...}` 或毫秒数。

`query` 无法解析时，任务会以配置错误直接终止并提示可用写法，不会静默地变成"读不到数据"。

`query` 没有匹配到任何文档、或者集合本身为空时，任务正常结束，读取 0 条记录（不会报错）。

## 类型转换

| Addax 内部类型 | MongoDB 数据类型                                                 |
| -------------- | ---------------------------------------------------------------- |
| Long           | int32, int64                                                     |
| Double         | double                                                           |
| String         | string, objectid, decimal128, array, document, timestamp, 正则等 |
| Date           | date                                                             |
| Boolean        | boolean                                                          |
| Bytes          | binary                                                           |

- `objectid` 读作 24 位十六进制字符串，`decimal128` 读作其十进制文本，`array` 和 `document` 读作扩展 JSON 文本。
- timestamp、正则表达式、minkey/maxkey 等没有对应 Addax 类型的值同样读作扩展 JSON 文本，与配置 `["*"]` 时的写法一致。
- 字段不存在或值为 `null` 时读作空字符串。
- 配置 `["*"]` 时整个文档作为一列扩展 JSON 文本读出，不再按上表拆分。
