# Hive Reader

Hive Reader plugin implements the ability to read data from [Apache Hive](https://hive.apache.org) database.

The main purpose of adding this plugin is to solve the problem of Kerberos authentication when using [RDBMS Reader][1] plugin to read Hive database. If your Hive database does not have Kerberos authentication enabled, you can directly use [RDBMS Reader][1]. If Kerberos authentication is enabled, you can use this plugin.

## Example

We create the following table in Hive's test database and insert a record:

<<<@/public/assets/sql/hive.sql

The following configuration reads this table to terminal:

<<<@/public/assets/jobs/hivereader.json
Save the above configuration file as `job/hive2stream.json`

### Execute Collection Command

Execute the following command for data collection

```bash
bin/addax.sh job/hive2stream.json
```

## Parameters

| Configuration          | Required | Type        | Default Value | Description                                                                                       |
| :--------------------- | :------: | ----------- | ------------- | ------------------------------------------------------------------------------------------------- |
| jdbcUrl                |   Yes    | list        | None          | JDBC connection information of target database                                                    |
| driver                 |    No    | string      | None          | Custom driver class name to solve compatibility issues                                            |
| username               |   Yes    | string      | None          | Username of data source                                                                           |
| password               |    No    | string      | None          | Password for specified username of data source, can be omitted if no password                      |
| table                  |   Yes    | list        | None          | The tables to read                                                                                |
| column                 |   Yes    | `list<map>` | None          | The columns to read, described in [RDBMS Reader][1]                                               |
| splitPk                |    No    | string      | None          | Split the read by this column, described in [RDBMS Reader][1]; see the note below for Hive        |
| where                  |    No    | string      | None          | Filter condition applied to the table                                                             |
| querySql               |    No    | list        | None          | Reads with this SQL instead of `table` and `column`                                                |
| fetchSize              |    No    | int         | 2048          | Rows fetched from HiveServer2 per round trip; a larger value means fewer round trips and more memory |
| haveKerberos           |    No    | string      | None          | Enable Kerberos authentication, the two settings below are then required                          |
| kerberosKeytabFilePath |    No    | string      | None          | Keytab file path, for example `/your/path/addax.service.keytab`                                   |
| kerberosPrincipal      |    No    | string      | None          | Kerberos principal, for example `addax/node1@EXAMPLE.COM`                                          |

### jdbcUrl

The URL either points at a HiveServer2 host and port directly, for example
`jdbc:hive2://node1:10000/default`, or uses ZooKeeper for service discovery and failover:

```java
jdbc:hive2://node1:2181,node2:2181,node3:2181/;serviceDiscoveryMode=zooKeeper;zooKeeperNamespace=hiveserver2
```

With Kerberos enabled, the URL also carries the principal, usually
`principal=hive/_HOST@EXAMPLE.COM` where `EXAMPLE.COM` is the realm.

### driver

The plugin ships the Hive 3.1.3 client (the `hive-*.jar` set under
`plugin/reader/hivereader/libs/`, including hive-jdbc, hive-service, hive-serde and
hive-common) and connects with `org.apache.hive.jdbc.HiveDriver`. To use a different client,
replace the jars in that directory and point `driver` at its class name. Keep the hive-*
jars on the same version: replacing hive-jdbc alone can leave classes missing or a protocol
version that does not match the rest of the client.

### splitPk

Hive has neither indexes nor primary keys, so a split key turns one query into several range
queries and **every range reads the whole table** (and plans its own job). Reading a partition
column through `where`, or letting HiveServer2 parallelize the single query, is usually the
better way to use the available bandwidth.

## Type conversion

The reader handles most Hive types; check the types of your own table before relying on it.

| Addax type | Hive types                                     |
| ---------- | ---------------------------------------------- |
| Long       | int, tinyint, smallint, mediumint, int, bigint |
| Double     | float, double, decimal                         |
| String     | varchar, char, string                          |
| Date       | date, timestamp                                |
| Boolean    | boolean                                        |
| Bytes      | binary                                         |

`array`, `map`, `struct` and types such as `timestamp with local time zone` and `interval`
are read as the text form the server serializes them to.

[1]: ./rdbmsreader

## Version support

**Since 6.1.1 the reader needs HiveServer2 3.0 or later; Hive 2.1.1 and earlier are no longer
supported.**

The bundled client was raised from Hive 2.1.1 (a compromise for CDH Hive 2.0) to Hive 3.1.3:

- the 2.1.1 driver cannot decode the schema a Hive 3 server returns for
  `timestamp with local time zone` and `interval` columns, which fails the whole query;
- the 3.1.3 client negotiates the protocol version with HiveServer2 3.0 and later, and has
  been verified against Apache Hive 3.1.0 reading ORC and Parquet tables.

To read Hive 2.1.1 or earlier, use hivereader from 6.1.0 or older, or replace the whole
client jar set with one that matches the server as described under `driver` above.
