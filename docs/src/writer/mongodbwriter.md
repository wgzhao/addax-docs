# MongoDB Writer

MongoDB Writer 插件用于向 [MongoDB](https://mongodb.com) 写入数据。

## 配置样例

该示例将流式数据写入到 MongoDB 表中

<<<@/public/assets/jobs/mongowriter.json

## 参数说明

| 配置项     | 是否必须 | 类型          | 默认值 | 描述                                                 |
| :--------- | :------: | ------------- | ------ | ---------------------------------------------------- |
| address    |    是    | list          | 无     | MongoDB 的数据地址信息                               |
| username   |    否    | string        | 无     | MongoDB 的用户名                                     |
| password   |    否    | string        | 无     | MongoDB 的密码                                       |
| collection |    是    | string        | 无     | MongoDB 的集合名                                     |
| column     |    是    | `list<map>/*` | 无     | MongoDB 的文档列名                                   |
| splitter   |    否    | string        | 无     | 特殊分隔符，详见下文                                 |
| writeMode  |    否    | string        | insert | 指定了传输数据时更新的信息,支持 insert， update 两种 |
| batchSize  |    否    | int           | 2048   | 指定批次输入的数量                                   |
| preSql     |    否    | object        | 无     | 写入前执行的语句，支持 drop 和 remove，详见下文      |

### column

`column` 指定 mongo collection 的字段以及类型，如果是数组类型，还需要指定接收到的数据按照什么分割，一个 `column` 字段至少需要指定 `name` 以及 `type`，比如

```json
{
  "column": [
    {
      "name": "user_id",
      "type": "string"
    }
  ]
}
```

`type` 支持的取值有 `string`（默认）、`int`（int32）、`long`（int64）、`double`、`date`、`bool`、`bytes`、`objectid`、`array` 以及 `json`，其中 `array` 必须同时配置 `splitter`。

如果是数组类型，则需要配置 `splitter` 来告知分隔符，类似如下：

```json
{
  "column": {
    "name": "taglist",
    "type": "Array",
    "splitter": " "
  }
}
```

也可以支持配置 `"*"` 来表示所有字段，比如：

```json
{
  "column": ["*"]
}
```

在这种情况下，插件会把一条记录当做一个完整的 MongoDB 文档来处理，然后转为 BSON 格式存储到 MongoDB 中

### splitter

当且仅当要处理的字符串要用分隔符分隔为字符数组时，才使用这个参数，通过这个参数指定的分隔符，将字符串分隔存储到 MongoDB 的数组中

### writeMode

不配置的情况下，默认采取直接插入记录的方式，如果希望实现插入更新（即记录存在则更新否则插入），可以指定为 `update` 模式，该模式下，必须同时更新的字段是哪个，比如：

```json
{
  "writeMode": "update(unique_id)"
}
```

上述配置表示依据字段 `unique_id` 来决定当前记录是插入还是更新，当前暂不支持指定多个字段，但更新字段可以是嵌套路径，如 `update(user.id)`。

更新字段必须是 `column` 中配置的字段之一；配置 `["*"]` 时记录本身就是一篇完整文档，更新字段必须是该文档里的字段。更新模式下每条记录在该字段上都必须有值：取不到值的记录会被收集为脏记录（受 `errorLimit` 控制），不会参与写入。这类记录在过去会产生 `{字段: null}` 的查询条件，从而覆盖掉一个它并未指定的文档。

`writeMode` 写错（既不是 `insert` 也不是 `update(字段)`）时按 `insert` 处理，同时在日志里给出告警。

### preSql

`preSql` 与 `column`、`writeMode` 同级，位于 writer 的 `parameter` 下；旧写法把它放在 `connection` 内，该写法仍然兼容，但两者同时配置时以 `preSql` 为准。

`preSql` 在写入之前执行，用于清理目标集合，支持 `drop` 和 `remove` 两种类型：

```json
{
  "preSql": {
    "type": "drop"
  }
}
```

```json
{
  "preSql": {
    "type": "remove",
    "json": {
      "city": "beijing"
    },
    "item": [
      {
        "name": "status",
        "condition": "$ne",
        "value": "active"
      }
    ]
  }
}
```

`remove` 的过滤条件由 `json` 和 `item` 两部分组成，两者可以同时配置，同时配置时按 `$and` 合并：

- `json`：原始查询条件，可以写成 JSON 对象，也可以写成扩展 JSON 字符串，写法与 reader 的 `query` 参数一致。注意它按扩展 JSON 解析而不是按 JavaScript 解析，日期不能写成 `new Date('2026-09-20')`
- `item`：条件列表，每项包含 `name`、可选的 `condition` 和 `value`，上述配置表示 `status != "active"`

两者都没有配置（或 `json` 为空对象）时，插件会直接报错终止，避免误删整个集合。

### 写入失败处理

- 一个批次以无序方式写入，服务端会保留批次中写入成功的文档，只报回失败文档的位置：这些文档被收集为脏记录（受 `errorLimit` 控制），同一批次里其它记录不受影响。
- 整批写入因连接等底层原因失败时（此时无法判断哪些文档已经写入），插件会退化为逐条写入，逐条失败的记录同样收集为脏记录。

## 类型转换

| Addax 内部类型 | MongoDB 数据类型 |
| -------------- | ---------------- |
| Long           | int, Long        |
| Double         | double           |
| String         | string, array    |
| Date           | date             |
| Boolean        | boolean          |
| Bytes          | binary           |
