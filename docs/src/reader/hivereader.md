# Hive Reader

Hive Reader 插件实现了从 [Apache Hive](https://hive.apache.org) 数据库读取数据的能力

新增该插件的主要目的是解决使用 [RDBMS Reader][1] 插件读取 Hive 数据库时不能解决 Kerberos 认证的问题， 如果你的 Hive 数据库没有启用 Kerberos 认证，那么直接使用 [RDBMS Reader][1] 也可以。 如果启用了 Kerberos 认证，则可以使用该插件。

## 示例

我们在 Hive 的 test 库上创建如下表，并插入一条记录

<<<@/public/assets/sql/hive.sql

下面的配置是读取该表到终端的作业:

<<<@/public/assets/jobs/hivereader.json

将上述配置文件保存为 `job/hive2stream.json`

### 执行采集命令

执行以下命令进行数据采集

```bash
bin/addax.sh job/hive2stream.json
```

## 参数说明

| 配置项                 | 是否必须 | 类型        | 默认值 | 描述                                                                   |
| :--------------------- | :------: | ----------- | ------ | ---------------------------------------------------------------------- |
| jdbcUrl                |    是    | list        | 无     | 对端数据库的 JDBC 连接信息                                             |
| driver                 |    否    | string      | 无     | 自定义驱动类名，解决兼容性问题，详见下面描述                           |
| username               |    是    | string      | 无     | 数据源的用户名                                                         |
| password               |    否    | string      | 无     | 数据源指定用户名的密码，若无密码，可不指定                             |
| table                  |    是    | list        | 无     | 所选取的需要同步的表名,使用 JSON 数据格式                              |
| column                 |    是    | `list<map>` | 无     | 所配置的表中需要同步的列名集合，详细描述见 [rdbmreader][1]             |
| splitPk                |    否    | string      | 无     | 使用 splitPk 代表的字段进行数据分片，**Hive 上没有索引，每个 channel 都会全表扫描一次**，见下文说明 |
| where                  |    否    | string      | 无     | 针对表的筛选条件                                                       |
| querySql               |    否    | list        | 无     | 使用 SQL 来获取数据，当配置了这一项之后， `table`，`column` 配置项无效 |
| fetchSize              |    否    | int         | 2048   | 每次从 HiveServer2 批量取回的记录数，调高可减少 RPC 往返次数，过大则占用更多内存 |
| haveKerberos           |    否    | string      | 无     | 是否启用 Kerberos 认证，如果启用，则需要同时配置下面两项               |
| kerberosKeytabFilePath |    否    | string      | 无     | Kerberos 认证的凭证文件路径, 比如 `/your/path/addax.service.keytab`    |
| kerberosPrincipal      |    否    | string      | 无     | Kerberos 认证的凭证主体, 比如 `addax/node1@EXAMPLE.COM`                |

### jdbcUrl

连接 Hive 的 JDBC URL 有多种写法，一种是直接指定 HiveServer/HiveServer2 服务的主机名和端口即可，比如： `jdbc:hive2://node1:10000/default`

如果你有多个 HiveServer/HiveServer2 服务，并采取用了服务发现，则可以通过指定 zookeeper 的方式来获得故障转移功能，类似如下：

```java
jdbc:hive2://node1:2181,node2:2181,node3:2181/;serviceDiscoveryMode=zooKeeper;zooKeeperNamespace=hiveserver2
```

如果你的 Hive 启用了 Kerberos 认证，还需要在 URL 后指定 `principal` 参数，一般为 `principal=hive/_HOST@EXAMPLE.COM`，其中 `EXAMPLE.COM` 为 `realm` 值。

### driver

当前 Addax 采用 **Hive 3.1.3** 的客户端（`plugin/reader/hivereader/libs/hive-*.jar`，包含 hive-jdbc、hive-service、hive-serde、hive-common 等一整套同版本 jar），驱动类名使用的 `org.apache.hive.jdbc.HiveDriver`， 如果当前的 Hive JDBC 驱动不兼容 Hive 数据库， 则可以通过以下步骤替换驱动。

**替换插件内置的驱动**

`rm -f plugin/reader/hivereader/libs/hive-jdbc-*.jar`

**拷贝兼容驱动到插件目录**

`cp hive-jdbc-<version>.jar plugin/reader/hivereader/libs/`

注意：客户端这几个 hive-*.jar 需要同版本，只换 hive-jdbc 而不同步替换 hive-service/hive-serde/hive-common 等，可能出现类找不到或协议版本对不上的问题。

**指定驱动类名称**

在你的 json 文件类，配置 `"driver": "<your jdbc class name>"`

### splitPk

Hive 上没有索引也没有主键，`splitPk` 会把一条查询拆成多个区间查询，而**每个区间都要全表扫描一次**（并且各自规划一次执行计划），因此通常比单通道读取更慢。要并行读取，建议用 `where` 按分区列把一个作业切成多个作业，或者直接让 HiveServer2 去并行执行那条查询。

## 类型转换

目前 HiveReader 支持大部分 Hive 类型，但也存在部分个别类型没有支持的情况，请注意检查你的类型。

下面列出 HiveReader 针对 Hive 类型转换列表:

| Addax 内部类型 | Hive 数据类型                                  |
| -------------- | ---------------------------------------------- |
| Long           | int, tinyint, smallint, mediumint, int, bigint |
| Double         | float, double, decimal                         |
| String         | varchar, char, string                          |
| Date           | date, timestamp                                |
| Boolean        | boolean                                        |
| Bytes          | binary                                         |

`array`、`map`、`struct` 以及 `timestamp with local time zone`、`interval` 等类型会按服务端序列化后的文本读成字符串。

[1]: ./rdbmsreader

## 相关限制

**从 6.1.1 起，HiveReader 最低支持 HiveServer2 3.0 版本，不再支持 Hive 2.1.1 及以下版本。**

插件内置的客户端驱动已经升级到 Hive 3.1.3（此前的 2.1.1 是为了兼容 CDH Hive 2.0 而做的妥协）：

- Hive 2.1.1 的驱动无法解析 Hive 3 服务端返回的 `timestamp with local time zone`、`interval` 等列类型，整条查询会直接失败；
- 反之，3.1.3 的客户端与 HiveServer2 3.0 及以上版本按协议版本协商，已在 Apache Hive 3.1.0 上验证读取 ORC / Parquet 表。

如果你必须读取 Hive 2.1.1 及以下版本，请使用 6.1.0 或更早版本的 hivereader，或按上文 `driver` 一节把客户端整组换成与服务端匹配的版本。
