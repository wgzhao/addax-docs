# Paimon Writer

Paimon Writer 提供向 已有的paimon表写入数据的能力。

## 配置样例

<<<@/public/assets/jobs/paimonwriter.json

## 参数说明

| 配置项          | 是否必须 | 数据类型 | 默认值 | 说明                                                                  |
| :-------------- | :------: | -------- | ------ | --------------------------------------------------------------------- |
| dbName          |    是    | string   | 无     | 要写入的paimon数据库名                                                |
| tableName       |    是    | string   | 无     | 要写入的paimon表名                                                    |
| writeMode       |    是    | string   | 无     | 写入模式，详述见下                                                    |
| column          |    否    | array    | 无     | 按名映射读取端的列到表的列，顺序与 reader 的 column 一致，详述见下    |
| writeBufferSize |    否    | string   | 64 mb  | 单个 task 允许缓冲的数据量（Paimon 的 `write-buffer-size`），详述见下 |
| paimonConfig    |    是    | json     | {}     | 里可以配置与 Paimon catalog和Hadoop 相关的一些高级参数，比如HA的配置  |

### writeMode

写入前数据清理处理模式：

- append / insert，写入前不做任何处理，直接写入，不清除原来的数据。
- truncate 写入前先清空表，再写入。

其它取值会被直接拒绝，而不是当成 append 写入。

### 表结构要求

- 表必须已经存在，插件只写数据，不建库建表。
- **分桶**：主键表请使用固定桶（`'bucket' = 'N'`）。Paimon 1.2 起主键表的默认值是动态桶（`'bucket' = '-1'`），而动态桶的桶归属由 Paimon 的 assigner 维护，离线批量写入无法参与其中，插件对这类表会直接报错，而不是写出一批重复主键。确实要做批量导入，可以用 postpone 桶（`'bucket' = '-2'`），但数据先落在 `bucket-postpone`，需要 Paimon compaction 之后才对查询可见。

### column

默认按位置把读取端的列对应到表的列。如果 reader 的列顺序和表结构不一致，用 `column` 显式按名映射：

```json
{
  "name": "paimonwriter",
  "parameter": {
    "dbName": "test",
    "tableName": "test2",
    "writeMode": "truncate",
    "column": ["name", "id"]
  }
}
```

`column` 里的名字个数和顺序要和 reader 输出的列一一对应，表里没有的列名会被拒绝；没有出现在 `column` 里的表列写入 NULL。

### writeBufferSize

一个 task 在写出数据文件之前允许缓冲的数据量，直接对应 Paimon 表属性 `write-buffer-size`。一个 task 只持有一个 writer，所以作业为此占用的堆内存上限约为 `通道数 × writeBufferSize`，默认值按启动脚本默认的 1G 堆给出。

优先级：job 里的 `writeBufferSize` > 表自身的 `write-buffer-size` > 默认的 `64 mb`。

### paimonConfig

`paimonConfig` 里可以配置与 Paimon catalog和Hadoop 相关的一些高级参数，比如HA的配置

本地目录创建paimon表

::: details

```xml
<?xml version="1.0" encoding="UTF-8"?>

<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
<modelVersion>4.0.0</modelVersion>

    <groupId>com.test</groupId>
    <artifactId>paimon-java-api-test</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.release>17</maven.compiler.release>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <hadoop.version>3.3.6</hadoop.version>
        <woodstox.version>7.2.2</woodstox.version>
    </properties>

<dependencies>
    <dependency>
        <groupId>org.apache.paimon</groupId>
        <artifactId>paimon-bundle</artifactId>
        <version>1.2.0</version>
    </dependency>

    <dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-common</artifactId>
        <version>${hadoop.version}</version>
        <exclusions>
            <exclusion>
                <groupId>com.fasterxml.jackson.core</groupId>
                <artifactId>jackson-databind</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.codehaus.jackson</groupId>
                <artifactId>jackson-core-asl</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.codehaus.jackson</groupId>
                <artifactId>jackson-mapper-asl</artifactId>
            </exclusion>
            <exclusion>
                <groupId>com.fasterxml.woodstox</groupId>
                <artifactId>woodstox-core</artifactId>
            </exclusion>
            <exclusion>
                <groupId>commons-codec</groupId>
                <artifactId>commons-codec</artifactId>
            </exclusion>
            <exclusion>
                <groupId>commons-net</groupId>
                <artifactId>commons-net</artifactId>
            </exclusion>
            <exclusion>
                <groupId>io.netty</groupId>
                <artifactId>netty</artifactId>
            </exclusion>
            <exclusion>
                <groupId>log4j</groupId>
                <artifactId>log4j</artifactId>
            </exclusion>
            <exclusion>
                <groupId>net.minidev</groupId>
                <artifactId>json-smart</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.codehaus.jettison</groupId>
                <artifactId>jettison</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.eclipse.jetty</groupId>
                <artifactId>jetty-server</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.xerial.snappy</groupId>
                <artifactId>snappy-java</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.apache.zookeeper</groupId>
                <artifactId>zookeeper</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.eclipse.jetty</groupId>
                <artifactId>jetty-util</artifactId>
            </exclusion>
        </exclusions>
    </dependency>

    <dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-aws</artifactId>
        <version>${hadoop.version}</version>
        <exclusions>
            <exclusion>
                <groupId>com.fasterxml.jackson.core</groupId>
                <artifactId>jackson-databind</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.codehaus.jackson</groupId>
                <artifactId>jackson-core-asl</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.codehaus.jackson</groupId>
                <artifactId>jackson-mapper-asl</artifactId>
            </exclusion>
            <exclusion>
                <groupId>com.fasterxml.woodstox</groupId>
                <artifactId>woodstox-core</artifactId>
            </exclusion>
            <exclusion>
                <groupId>commons-codec</groupId>
                <artifactId>commons-codec</artifactId>
            </exclusion>
            <exclusion>
                <groupId>commons-net</groupId>
                <artifactId>commons-net</artifactId>
            </exclusion>
            <exclusion>
                <groupId>io.netty</groupId>
                <artifactId>netty</artifactId>
            </exclusion>
            <exclusion>
                <groupId>log4j</groupId>
                <artifactId>log4j</artifactId>
            </exclusion>
            <exclusion>
                <groupId>net.minidev</groupId>
                <artifactId>json-smart</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.codehaus.jettison</groupId>
                <artifactId>jettison</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.eclipse.jetty</groupId>
                <artifactId>jetty-server</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.xerial.snappy</groupId>
                <artifactId>snappy-java</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.apache.zookeeper</groupId>
                <artifactId>zookeeper</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.eclipse.jetty</groupId>
                <artifactId>jetty-util</artifactId>
            </exclusion>
        </exclusions>
    </dependency>

    <dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-mapreduce-client-core</artifactId>
        <version>${hadoop.version}</version>
        <exclusions>
            <exclusion>
                <groupId>com.fasterxml.jackson.core</groupId>
                <artifactId>jackson-databind</artifactId>
            </exclusion>
            <exclusion>
                <groupId>commons-codec</groupId>
                <artifactId>commons-codec</artifactId>
            </exclusion>
            <exclusion>
                <groupId>io.netty</groupId>
                <artifactId>netty</artifactId>
            </exclusion>
            <exclusion>
                <groupId>org.eclipse.jetty</groupId>
                <artifactId>jetty-util</artifactId>
            </exclusion>
        </exclusions>
    </dependency>


    <dependency>
        <groupId>com.fasterxml.woodstox</groupId>
        <artifactId>woodstox-core</artifactId>
        <version>${woodstox.version}</version>
    </dependency>

</dependencies>
</project>
```

:::

程序代码

::: details

```java
import org.apache.hadoop.conf.Configuration;
import org.apache.paimon.catalog.Catalog;
import org.apache.paimon.catalog.CatalogContext;
import org.apache.paimon.catalog.CatalogFactory;
import org.apache.paimon.catalog.Identifier;
import org.apache.paimon.fs.Path;
import org.apache.paimon.options.Options;
import org.apache.paimon.schema.Schema;
import org.apache.paimon.types.DataTypes;

public class CreatePaimonTable {

    public static Catalog createFilesystemCatalog() {
        CatalogContext context = CatalogContext.create(new Path("file:///tmp/paimon"));
        return CatalogFactory.createCatalog(context);
    }

    /* 如果是 minio 则例子如下

    public static Catalog createFilesystemCatalog() {
        Options options = new Options();
        options.set("warehouse", "s3a://my-bucket/paimon");
        Configuration hadoopConf = new Configuration();
        hadoopConf.set("fs.s3a.endpoint", "http://localhost:9000");
        hadoopConf.set("fs.s3a.access.key", "your-access-key");
        hadoopConf.set("fs.s3a.secret.key", "your-secret-key");
        hadoopConf.set("fs.s3a.connection.ssl.enabled", "false");
        hadoopConf.set("fs.s3a.path.style.access", "true");
        hadoopConf.set("fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem");
        return CatalogFactory.createCatalog(CatalogContext.create(options, hadoopConf));
    }
    */

    public static void main(String[] args) {
        Identifier identifier = Identifier.create("test", "test2");
        Schema schema = Schema.newBuilder()
                .column("id", DataTypes.INT())
                .column("name", DataTypes.STRING())
                .primaryKey("id")
                // 固定桶，动态桶（-1）的桶归属由 Paimon 的 assigner 维护，离线写入无法参与，见「表结构要求」
                .option("bucket", "1")
                .option("bucket-key", "id")
                .option("file.format", "orc")
                .option("file.compression", "lz4")
                .option("manifest.format", "orc")
                .build();

        try (Catalog catalog = createFilesystemCatalog()) {
            catalog.createDatabase("test", true);
            catalog.createTable(identifier, schema, true);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

:::

Spark 或者 flink 环境创建表

```sql
CREATE TABLE if not exists test.test2(id int ,name string) tblproperties (
    'primary-key' = 'id',
    'bucket' = '1',
    'bucket-key' = 'id',
    'file.format' = 'orc',
    'file.compression' = 'lz4',
    'manifest.format' = 'orc'
)
```

本地文件例子

```json
{
  "name": "paimonwriter",
  "parameter": {
    "dbName": "test",
    "tableName": "test2",
    "writeMode": "truncate",
    "paimonConfig": {
      "warehouse": "file:///g:/paimon",
      "metastore": "filesystem"
    }
  }
}
```

s3 或者 minio catalog例子

```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 3
      },
      "errorLimit": {
        "record": 0,
        "percentage": 0
      }
    },
    "content": [
      {
        "reader": {
          "name": "rdbmsreader",
          "parameter": {
            "username": "root",
            "password": "root",
            "column": ["*"],
            "connection": [
              {
                "querySql": ["select 1+0 id ,'test1' as name"],
                "jdbcUrl": [
                  "jdbc:mysql://localhost:3306/ruoyi_vue_camunda?allowPublicKeyRetrieval=true"
                ]
              }
            ],
            "fetchSize": 1024
          }
        },
        "writer": {
          "name": "paimonwriter",
          "parameter": {
            "dbName": "test",
            "tableName": "test2",
            "writeMode": "truncate",
            "paimonConfig": {
              "warehouse": "s3a://pvc-91d1e2cd-4d25-45c9-8613-6c4f7bf0a4cc/paimon",
              "metastore": "filesystem",
              "fs.s3a.endpoint": "http://localhost:9000",
              "fs.s3a.access.key": "your-access-key",
              "fs.s3a.secret.key": "your-secret-key",
              "fs.s3a.connection.ssl.enabled": "false",
              "fs.s3a.path.style.access": "true",
              "fs.s3a.impl": "org.apache.hadoop.fs.s3a.S3AFileSystem"
            }
          }
        }
      }
    ]
  }
}
```

hdfs catalog例子

```json
{
  "paimonConfig": {
    "warehouse": "hdfs://nameservice1/user/hive/paimon",
    "metastore": "filesystem",
    "fs.defaultFS": "hdfs://nameservice1",
    "hadoop.security.authentication": "kerberos",
    "hadoop.kerberos.principal": "hive/_HOST@XXXX.COM",
    "hadoop.kerberos.keytab": "/tmp/hive@XXXX.COM.keytab",
    "ha.zookeeper.quorum": "test-pr-nn1:2181,test-pr-nn2:2181,test-pr-nn3:2181",
    "dfs.nameservices": "nameservice1",
    "dfs.namenode.rpc-address.nameservice1.namenode371": "test-pr-nn2:8020",
    "dfs.namenode.rpc-address.nameservice1.namenode265": "test-pr-nn1:8020",
    "dfs.namenode.keytab.file": "/tmp/hdfs@XXXX.COM.keytab",
    "dfs.namenode.keytab.enabled": "true",
    "dfs.namenode.kerberos.principal": "hdfs/_HOST@XXXX.COM",
    "dfs.namenode.kerberos.internal.spnego.principal": "HTTP/_HOST@XXXX.COM",
    "dfs.ha.namenodes.nameservice1": "namenode265,namenode371",
    "dfs.datanode.keytab.file": "/tmp/hdfs@XXXX.COM.keytab",
    "dfs.datanode.keytab.enabled": "true",
    "dfs.datanode.kerberos.principal": "hdfs/_HOST@XXXX.COM",
    "dfs.client.use.datanode.hostname": "false",
    "dfs.client.failover.proxy.provider.nameservice1": "org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider",
    "dfs.balancer.keytab.file": "/tmp/hdfs@XXXX.COM.keytab",
    "dfs.balancer.keytab.enabled": "true",
    "dfs.balancer.kerberos.principal": "hdfs/_HOST@XXXX.COM"
  }
}
```

## 类型转换

| Addax 内部类型     | Paimon 数据类型              |
| ------------------ | ---------------------------- |
| Integer            | TINYINT,SMALLINT,INT,INTEGER |
| Long               | BIGINT                       |
| Double             | FLOAT,DOUBLE,DECIMAL         |
| String             | STRING,VARCHAR,CHAR          |
| Boolean            | BOOLEAN                      |
| Date               | DATE,TIMESTAMP               |
| Bytes              | BINARY                       |
| String（逗号分隔） | ARRAY                        |
| String（JSON对象） | MAP                          |

复杂类型（ARRAY / MAP）以文本形式传入：ARRAY 是逗号分隔的列表，例如 `1,2,3`，元素两侧空白会被去掉，元素内不能出现逗号；MAP 是 JSON 对象，例如 `{"a": 1}`。元素/键值按表里声明的类型转换。

## 脏数据

某一列转换失败（例如时间字符串格式不对）时，整条记录记为脏数据并被跳过，不会把写了一半的记录送进表里，因此作业的 `errorLimit` 会自动覆盖这类问题。
