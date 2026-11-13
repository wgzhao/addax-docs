# Oracle Reader

Oracle Reader 插件用于从 Oracle 读取数据

## 配置样例

配置一个从Oracle数据库同步抽取数据到本地的作业:

<<<@/public/assets/jobs/oraclereader.json

## 参数说明

该插件基于 [RDBMS Reader](rdbmsreader) 实现，因此可以参考 RDBMS Reader 的所有配置项。

## 对 GEOMETRY 类型的支持

从 Addax `4.0.13` 开始，实验性的支持 Oracle GEOMETRY 类型，该插件会把该类型的数据转为 JSON 数组字符串。

假定你有这样的的表和数据

<<<@/public/assets/sql/oracle_geom.sql

读取表该的数据的最后输出结果类似如下：

<<<@/public/assets/output/oracle_geom_reader.txt

注意：该数据类型目前还处于实验支持阶段，作者对此数据类型的理解并不深刻，也未经过全面的测试，请勿直接在生产环境使用。

## 对二进制类型的支持

Oracle 的 `BLOB`、`RAW`、`LONG RAW` 列在 Addax 内部表示为 `Bytes`（原始字节数组），读取时不做任何编码转换：

- 写入二进制类型的 writer（oraclewriter、mysqlwriter、postgresqlwriter 等）时按原始字节写入，可以逐字节还原；NULL 读取后仍然是 NULL。
- 写入文本类型的 writer（txtfilewriter、ftpwriter）时写成 Base64 字符串，NULL 由 `nullFormat` 表示。
- 单条记录（含二进制列）不能超过通道的 `core.transport.channel.byteCapacity`（`conf/core.json` 默认为 64MB）。超过时任务会失败并提示调整该配置，而不是丢弃这条记录；注意这个上限是每条排队记录占用的内存。

Oracle 到 Oracle 的 BLOB 传输已按上述方式验证过：`insert` 和 `update(id)`（MERGE）两种写入模式下，5 字节到 8.8MB 的 BLOB 都能逐字节还原。
