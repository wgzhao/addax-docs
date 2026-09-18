# TxtFile Writer

TxtFile Writer 提供了向本地文件写入类 CSV 格式的一个或者多个表文件。

## 配置样例

<<<@/public/assets/jobs/txtwriter.json

## 参数说明

| 配置项         | 是否必须 | 数据类型 | 默认值 | 描述                                                              |
| :------------- | :------: | -------- | ------ | ----------------------------------------------------------------- |
| path           |    是    | string   | 无     | 本地文件系统的路径信息，写入 Path 目录下属多个文件                |
| fileName       |    是    | string   | 无     | 写入的文件名，该文件名会添加随机的后缀作为每个线程写入实际文件名  |
| writeMode      |    是    | string   | 无     | 写入前数据清理处理模式，详见下文                                  |
| fieldDelimiter |    是    | string   | `,`    | 描述：读取的字段分隔符                                            |
| compress       |    否    | string   | 无     | 文本压缩类型，支持压缩类型为 `zip`、`lzo`、`lzop`、`tgz`、`bzip2` |
| encoding       |    否    | string   | utf-8  | 读取文件的编码配置                                                |
| nullFormat     |    否    | string   | `\N`   | 定义哪些字符串可以表示为 null                                     |
| dateFormat     |    否    | string   | 无     | 日期类型的数据序列化到文件中时的格式，例如 `"yyyy-MM-dd"`         |
| fileFormat     |    否    | string   | text   | 文件写出的格式，详见下文                                          |
| table          |    是    | string   | 无     | sql 模式时需要指定表名，                                          |
| column         |    否    | list     | 无     | sql 模式时可选指定列名，                                          |
| extendedInsert |    否    | boolean  | true   | sql 模式时是否使用批量插入语法，详见下文                          |
| batchSize      |    否    | int      | 2048   | sql 模式时批量插入语法的批次大小，详见下文                        |
| header         |    否    | list     | 无     | text 写出时的表头，示例 `['id', 'name', 'age']`                   |

### writeMode

写入前数据清理处理模式：

- truncate，写入前清理目录下一 fileName 前缀的所有文件。
- append，写入前不做任何处理，直接使用 filename 写入，并保证文件名不冲突。
- nonConflict，如果目录下有 fileName 前缀的文件，直接报错。

### fileFormat

文件写出的格式，包括 csv 和 text 和 `4.1.3` 版本引入的 sql 三种。

`csv` 和 `text` 目前由同一套 CSV 写出逻辑处理，因此两者都会对包含列分隔符、双引号或换行的字段按 CSV 语法转义，转义符号为双引号 `"`；当
`fieldDelimiter` 配置为 `\n` 或 `\r` 时（历史遗留的“一个字段一行”写法），字段之间不再转义，直接按分隔符拼接。

sql 格式表示将数据以 SQL 语句 (`INSERT INTO ... VALUES`) 的方式写入到文件

### 二进制列

`Bytes` 类型（Oracle 的 `BLOB`/`RAW`/`LONG RAW`、MySQL 的 `BLOB`/`VARBINARY` 等）写出的是 Base64 字符串，不会按 `encoding` 解码：按文本解码会把所有大于
`0x7F` 的字节替换成 `U+FFFD`，并把 `0x0A` 原样写进文件而破坏记录行。SQL NULL 仍然由 `nullFormat` 表示（默认 `\N`）。`fileFormat` 为 `sql`
时同样输出 Base64 字符串字面量。

### table

仅在 sql 文件格式下需要，用来指定写入的表名

### column

在 sql 文件格式下，可以指定写入的列名，如果指定，则 sql
语句类似 `INSERT INTO table (col1, col2, col3) VALUES (val1, val2, val3)`，模式
否则为 `INSERT INTO table VALUES (val1, val2, val3)`。模式

### extendedInsert

是否启用批量插入语法，如果启用，则会将 batchSize 个数据一次性写入到文件中，否则每个数据一行。该参数借鉴了 `mysqldump` 工具的
[extended-insert](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html#option_mysqldump_extended-insert) 参数语法

### batchSize

批量插入语法的批次大小，如果 extendedInsert 为 true，则每 batchSize 个数据一次性写入到文件中，否则每个数据一行。

## 类型转换

| Addax 内部类型 | 本地文件 数据类型 |
| -------------- | ----------------- |
|                |
| Long           | Long              |
| Double         | Double            |
| string         | string            |
| Boolean        | Boolean           |
| Date           | Date              |
| Bytes          | Base64 字符串     |
