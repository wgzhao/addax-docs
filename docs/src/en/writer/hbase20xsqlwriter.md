# HBase20x SQL Writer

The HBase20x SQL Writer plugin uses Phoenix to write data to HBase 2.x.

Support for HBase 1.x was removed in version 6.0.11; this plugin only supports HBase 2.x.

## Configuration Example

<<<@/public/assets/jobs/hbase20xsqlwriter.json

## Parameters

| Configuration          | Required | Data Type | Default Value | Description                                                                                  |
| ---------------------- | :------: | --------- | ------------- | -------------------------------------------------------------------------------------------- |
| jdbcUrl                |   Yes    | string    | None          | Phoenix connection address                                                                   |
| table                  |   Yes    | string    | None          | Name of the table to read                                                                    |
| schema                 |    No    | string    | None          | Schema where the table resides                                                               |
| batchSize              |    No    | int       | 256           | Maximum number of rows written in one batch                                                  |
| column                 |    No    | list      | None          | Column names, case-sensitive; Phoenix column names are usually **uppercase**                 |
| nullMode               |    No    | string    | skip          | How to handle null values read, see details below                                            |
| haveKerberos           |    No    | boolean   | false         | Whether to enable Kerberos authentication, true means enabled, false means disabled          |
| kerberosPrincipal      |    No    | string    | None          | Kerberos credential information, only effective when `havekerberos` is enabled               |
| kerberosKeytabFilePath |    No    | string    | None          | Absolute path of the Kerberos credential file, only effective when `havekerberos` is enabled |

### jdbcUrl

`jdbcUrl` is the Phoenix JDBC connection address. It supports the thin mode of Phoenix Query Server and the thick mode that connects directly to ZooKeeper.

#### Thin mode (default, works out of the box)

The distribution bundles the Phoenix Query Server thin client (`phoenix-queryserver-client`, about 6 MB); the JDBC connection string is as follows:

```java
jdbc:phoenix:thin:url=<scheme>://<server-hostname>:<port>[;option=value...]
```

- schema: transport protocol, `http` or `https`, defaults to `http`
- server-hostname: Phoenix Query Server address, e.g. `node1`
- port: Phoenix Query Server port, defaults to 8765
- option: optional parameters, may be multiple, separated by commas, e.g. `option1=value1,option2=value2`

For a more detailed description, see the [official documentation][2]

#### Thick mode (driver required)

::: warning
The distribution no longer bundles the thick driver. The previously required `phoenix-client-hbase-2.1` is a ~144 MB HBase/Hadoop shaded full package, whereas the thin client is only about 6 MB, so only the thin client is published by default.

To use thick mode, put the thick client matching the cluster's Phoenix version (for example `phoenix-client-hbase-2.1-5.1.3.jar` for Phoenix 5.1.x) into `plugin/writer/hbase20xsqlwriter/libs/`; if the distribution has been processed with `shrink_package.sh`, put it into `shared/` and create a same-named symlink under `libs/`. Without this jar, the plugin reports `JDBC driver org.apache.phoenix.jdbc.PhoenixDriver not found` at startup.
:::

For the connection string format and the meaning of each parameter, see the [official documentation][1]:

```java
jdbc:phoenix [ :<zookeeper quorum> [ :<port number> [ :<root node> [ :<principal> [ :<keytab file> ] ] ] ] ]
```

- zookeeper quorum: ZooKeeper cluster address, multiple addresses separated by commas, e.g. `node1,node2,node3`
- port number: ZooKeeper cluster port, defaults to 2181
- root node: ZooKeeper cluster root node, defaults to `/hbase`; after Kerberos is enabled, defaults to `/hbase-secure`
- principal: Kerberos credential information, only effective when `havekerberos` is enabled
- keytab file: absolute path of the Kerberos credential file, only effective when `havekerberos` is enabled

### nullMode

`skip` means the column is not written to HBase; `empty` writes `HConstants.EMPTY_BYTE_ARRAY`, i.e. `new byte [0]`

Note: after Kerberos authentication is enabled in thick mode, the program needs to know the path where `hbase-site.xml` is located. One approach is to add the directory containing that file to the `CLASSPATH` environment variable when running.

Another solution is to copy the `hbase-site.xml` file into the plugin's `libs` directory. In thin mode, Kerberos credentials are passed through the connection string, so `hbase-site.xml` is not needed.

[1]: http://phoenix.apache.org/index.html
[2]: https://phoenix.apache.org/documentation/queryserver/connect.html
