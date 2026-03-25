# Doris Reader

DorisReader 插件实现了使用 [Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSQL.html) 协议从 Apache Doris 读取数据的能力。

如果你想使用 MySQL 兼容的方式连接 Doris，可以使用 [MySQLReader](mysqlreader.md) 插件。

## 前提要求

Doris 集群的 BE 节点和 FE 节点必须配置了 `arrow_flight_sql_port` 端口，详细配置请参考 [Doris 官方文档](https://doris.apache.org/zh-CN/docs/2.1/db-connect/arrow-flight-sql-connect)。

## 示例

下面的配置示例使用 Arrow Flight SQL 协议从 Doris 读取数据到终端：

<<<@/public/assets/jobs/dorisreader.json

将上述配置文件保存为 `job/doris2stream.json`。

### 执行采集命令

```shell
bin/addax.sh job/doris2stream.json
```

## 参数说明

该插件基于 [RDBMS Reader](rdbmsreader.md) 实现，因此可以参考 RDBMS Reader 的所有配置项。

### JVM 兼容性

如果使用 Java 9 及以上版本运行 Arrow Flight SQL 协议，需在 JVM 参数中加入：

```shell
--add-opens=java.base/java.nio=ALL-UNNAMED
```

## 注意事项

- 改插件从 `6.0.10` 版本开始支持，使用前请确保 Addax 版本满足要求。
- Arrow Flight SQL 与 MySQL 协议的参数不完全一致，请根据 [Doris 官方文档](https://doris.apache.org/zh-CN/docs/2.1/db-connect/arrow-flight-sql-connect) 进行配置。

