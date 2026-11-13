# HBase20x SQL Writer

HBase20x SQL Writer plugin implements writing data to HBase 2.x via Phoenix SQL interface.

## Configuration Example

This plugin is used to write data to HBase 2.x via Phoenix. This plugin is based on [RDBMS Writer](rdbmswriter), so you can refer to all configuration items of RDBMS Writer.

<<<@/public/assets/jobs/hbase20xsqlwriter.json

## Connection modes

The distribution ships only the Phoenix Query Server thin client (`phoenix-queryserver-client`, about 6 MB), so the thin URL works out of the box:

```java
jdbc:phoenix:thin:url=<scheme>://<server-hostname>:<port>[;option=value...]
```

::: warning
The thick client is not bundled. `phoenix-client-hbase-2.1` is a ~144 MB HBase/Hadoop shaded jar, while the thin client is about 6 MB, so only the thin client is published with the distribution.

To use a thick URL (`jdbc:phoenix:<zookeeper quorum>:2181...`), put the thick client matching your Phoenix version (for example `phoenix-client-hbase-2.1-5.1.3.jar` for Phoenix 5.1.x) into `plugin/writer/hbase20xsqlwriter/libs/`; when the distribution was shrunk with `shrink_package.sh`, put it into `shared/` and create a same-named symlink under `libs/`. Without it the plugin fails at startup with `JDBC driver org.apache.phoenix.jdbc.PhoenixDriver not found`.
:::
