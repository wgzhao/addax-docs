# Paimon Writer

Paimon Writer provides the ability to write data into an existing Paimon table.

## Configuration Example

<<<@/public/assets/jobs/paimonwriter.json

## Parameters

| Configuration   | Required | Data Type | Default Value | Description                                                                                                                           |
| :-------------- | :------: | :-------- | :------------ | :------------------------------------------------------------------------------------------------------------------------------------ |
| dbName          |   Yes    | string    | None          | Name of the Paimon database to write to                                                                                               |
| tableName       |   Yes    | string    | None          | Name of the Paimon table to write to                                                                                                  |
| writeMode       |   Yes    | string    | None          | Write mode, detailed description below                                                                                                |
| column          |    No    | array     | None          | Maps the columns on the reading side to table columns by name, in the same order as the reader's `column`, detailed description below |
| writeBufferSize |    No    | string    | 64 mb         | Amount of data a single task may buffer (Paimon's `write-buffer-size`), detailed description below                                    |
| paimonConfig    |   Yes    | json      | {}            | Some advanced parameters related to the Paimon catalog and Hadoop can be configured here, such as HA configuration                    |

### writeMode

Data cleanup mode before writing:

- append / insert: no processing is done before writing, the data is written directly and the original data is not cleared.
- truncate: clear the table first, then write.

Any other value is rejected directly instead of being treated as append.

### Table Structure Requirements

- The table must already exist; the plugin only writes data, it does not create databases or tables.
- **Buckets**: use fixed buckets (`'bucket' = 'N'`) for primary key tables. Since Paimon 1.2 the default for a primary key table is dynamic buckets (`'bucket' = '-1'`), and the bucket ownership of dynamic buckets is maintained by Paimon's assigner, which an offline batch write cannot take part in, so the plugin reports an error directly for such tables instead of writing out a batch of duplicate primary keys. If you really need to do a bulk import, you can use postpone buckets (`'bucket' = '-2'`), but the data first lands in `bucket-postpone` and only becomes visible to queries after Paimon compaction.

### column

By default the columns on the reading side are mapped to the table columns by position. If the reader's column order does not match the table structure, use `column` to map explicitly by name:

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

The number and order of the names in `column` must correspond one-to-one with the columns output by the reader; a column name that does not exist in the table is rejected; table columns that do not appear in `column` are written as NULL.

### writeBufferSize

The amount of data a task is allowed to buffer before it writes out a data file, directly corresponding to the Paimon table property `write-buffer-size`. A task holds only one writer, so the upper bound of heap memory the job occupies for this is about `number of channels × writeBufferSize`, and the default value is chosen for the 1G heap given by the default startup script.

Priority: `writeBufferSize` in the job > the table's own `write-buffer-size` > the default `64 mb`.

### paimonConfig

`paimonConfig` can be used to configure some advanced parameters related to the Paimon catalog and Hadoop, such as HA configuration.

Create a Paimon table in a local directory

::: details Maven dependencies

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

Program code

::: details Java code

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

    /* if it is minio, the example is as follows

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
                // fixed bucket; the bucket ownership of dynamic buckets (-1) is maintained by Paimon's assigner, which offline writes cannot take part in, see "Table Structure Requirements"
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

Create a table in a Spark or Flink environment

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

Local file example

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

S3 or MinIO catalog example

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

HDFS catalog example

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

## Type Conversion

| Addax Internal Type      | Paimon Data Type             |
| :----------------------- | :--------------------------- |
| Integer                  | TINYINT,SMALLINT,INT,INTEGER |
| Long                     | BIGINT                       |
| Double                   | FLOAT,DOUBLE,DECIMAL         |
| String                   | STRING,VARCHAR,CHAR          |
| Boolean                  | BOOLEAN                      |
| Date                     | DATE,TIMESTAMP               |
| Bytes                    | BINARY                       |
| String (comma separated) | ARRAY                        |
| String (JSON object)     | MAP                          |

Complex types (ARRAY / MAP) are passed in as text: an ARRAY is a comma-separated list, for example `1,2,3`, the whitespace on both sides of an element is stripped, and an element must not contain a comma; a MAP is a JSON object, for example `{"a": 1}`. Elements/keys and values are converted according to the types declared in the table.

## Dirty Data

When the conversion of a column fails (for example a time string in the wrong format), the whole record is marked as dirty data and skipped; a half-written record is never sent into the table, so the job's `errorLimit` automatically covers such problems.
