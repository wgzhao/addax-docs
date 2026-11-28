# IoTDB Writer

IoTDB Writer 插件用于将数据写入 [Apache IoTDB](https://iotdb.apache.org)。tree model 通过 IoTDB Session API 批量写入，table model 通过 JDBC batch 写入。

## 配置样例

以下示例把生成的数据写入 tree model 的一个设备：

<<<@/public/assets/jobs/iotdbwriter.json

将上述配置文件保存为 `job/stream2iotdb.json`，执行：

```bash
bin/addax.sh job/stream2iotdb.json
```

## 参数说明

| 配置项             |  是否必须   | 类型   | 默认值 | 描述                                                                                                    |
| :----------------- | :---------: | ------ | ------ | ------------------------------------------------------------------------------------------------------- |
| username           |     是      | string | 无     | IoTDB 用户名                                                                                            |
| password           |     否      | string | 无     | IoTDB 密码                                                                                              |
| connection.jdbcUrl |     是      | string | 无     | JDBC 连接串，例如 `jdbc:iotdb://127.0.0.1:6667/`                                                        |
| sqlDialect         |     否      | string | tree   | `tree` 或 `table`；未配置时从 jdbcUrl 中的 `sql_dialect` 推断                                           |
| device             | 是（tree）  | string | 无     | tree model 的目标设备路径，例如 `root.factory.device1`                                                  |
| measurements       | 是（tree）  | list   | 无     | tree model 的测点名列表，顺序与记录中除 time 外的列一致                                                 |
| columnTypes        | 否（tree）  | list   | 无     | tree model 的测点类型，可选 `INT32`、`INT64`、`FLOAT`、`DOUBLE`、`BOOLEAN`、`TEXT`、`TIMESTAMP`、`BLOB` |
| table              | 是（table） | string | 无     | table model 的目标表，格式为 `database.table`                                                           |
| column             | 是（table） | list   | 无     | table model 的插入列，必须包含 time 列                                                                  |
| timeColumnPosition |     否      | int    | 0      | 记录中 time 列的位置                                                                                    |
| batchSize          |     否      | int    | 1000   | 每批写入的记录数                                                                                        |
| preSql             |     否      | list   | 无     | 所有 task 开始前执行一次的 SQL，支持 `${table}` / `${device}` 占位符                                    |
| postSql            |     否      | list   | 无     | 所有 task 结束后执行一次的 SQL，占位符同上                                                              |

## Tree model

tree model 的记录必须包含 `measurements.size() + 1` 列：time 列位于 `timeColumnPosition`，其余列按顺序对应 `measurements`。插件通过 `Session.insertRecordsOfOneDevice` 批量写入。

```json
{
  "device": "root.demo.d1",
  "measurements": ["s1", "s2"],
  "timeColumnPosition": 0,
  "batchSize": 1000
}
```

### columnTypes

不配置 `columnTypes` 时，插件从每个测点在本批次中第一个非空值推断 IoTDB 类型：

- Addax Long → `INT64`
- Addax Double → `DOUBLE`
- Addax String → `TEXT`
- Addax Boolean → `BOOLEAN`
- Addax Date/Timestamp → `TIMESTAMP`
- Addax Bytes → `BLOB`

如果某个测点在第一批中全部为空，或者需要把 Long 写入 `INT32`、把 Double 写入 `FLOAT`，必须显式配置 `columnTypes`：

```json
{
  "measurements": ["s1", "s2"],
  "columnTypes": ["INT32", "DOUBLE"]
}
```

`columnTypes` 的顺序必须与 `measurements` 一致，长度也必须一致。类型不匹配的记录会作为脏数据收集。

## Table model

table model 的记录必须包含 `column.size()` 列，time 列位于 `timeColumnPosition`。目标表必须已经存在，或者由 `preSql` 创建；插件会读取目标表元数据（`SELECT ... WHERE 1 = 2`）来决定每个参数如何绑定。

```json
{
  "sqlDialect": "table",
  "table": "demo.metrics",
  "column": ["time", "device_id", "temperature", "humidity"],
  "timeColumnPosition": 0,
  "batchSize": 1000
}
```

table model 只存在于 IoTDB 2.x；连接 1.x server 时任务会在启动阶段报错并提示需要 2.x。

## preSql / postSql

`preSql` 在所有读取/写入 task 开始前执行一次，`postSql` 在全部 task 成功后执行一次。SQL 中的 `${table}` 和 `${device}` 会被替换为当前目标：

```json
{
  "preSql": [
    "CREATE TABLE demo.metrics (device_id STRING TAG, temperature FLOAT FIELD)"
  ],
  "postSql": ["DELETE FROM demo.metrics WHERE time < 0"]
}
```

## 类型转换

| Addax 内部类型 | IoTDB 数据类型  |
| -------------- | --------------- |
| Long           | INT32, INT64    |
| Double         | FLOAT, DOUBLE   |
| String         | TEXT, STRING    |
| Boolean        | BOOLEAN         |
| Date/Timestamp | TIMESTAMP, DATE |
| Bytes          | BLOB            |

table model 以目标表 schema 为准，源值会尽量转换为目标列类型；tree model 以 `columnTypes` 或推断类型为准。

## 当前支持版本

- IoTDB 2.x：tree model 和 table model。
- IoTDB 1.3.7 及以上：仅 tree model，best effort；插件使用 2.0.x client，厂商不保证新客户端连接旧服务端。
- IoTDB 1.0–1.2：不支持。

## 注意事项

- 时间按毫秒处理，这与 IoTDB 默认精度一致；配置为微秒或纳秒精度的 server 暂不支持。
- 一个 job 只写一个 device 或一张 table；多设备路由（按记录中的 device 列分发）暂未实现。
- IoTDB 按 device/tag + time 幂等写入，任务失败重试会覆盖同一时间点的数据，不会产生重复行。
