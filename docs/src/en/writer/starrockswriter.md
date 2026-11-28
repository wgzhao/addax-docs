# StarRocks Writer

The StarRocks Writer plugin writes data to a [StarRocks](https://www.starrocks.com/zh-CN/index) database in a streaming fashion. Internally it connects through the Doris HTTP port (8030) and then loads the data with [Stream Load](https://docs.starrocks.com/zh-cn/main/loading/StreamLoad). Compared with `insert into`, it is considerably more efficient and is the officially recommended way to load data in production.

StarRocks is a MySQL protocol compatible database backend, so it can be read with [MySQLReader](../reader/mysqlreader).

## Configuration Example

Assume the target table is created as follows:

```sql
CREATE DATABASE example_db;
CREATE TABLE example_db.table1
(
siteid INT DEFAULT '10',
citycode SMALLINT,
username VARCHAR(32) DEFAULT '',
pv BIGINT SUM DEFAULT '0'
) AGGREGATE KEY(siteid, citycode, username)
DISTRIBUTED BY HASH(siteid) BUCKETS 10
PROPERTIES("replication_num" = "1");
```

The following configuration reads data from memory and writes it into the StarRocks table:

<<<@/public/assets/jobs/starrockswriter.json

Save the above configuration file as `job/stream2starrocks.json` and run the following command:

```bash
bin/addax.sh job/stream2starrocks.json
```

## Parameters

This plugin is based on [RDBMS Writer](rdbmswriter), so all configuration options of RDBMS Writer apply, plus the following options:

| Configuration | Required | Data Type | Default Value | Description                                                                    |
| :------------ | :------: | --------- | ------------- | ------------------------------------------------------------------------------ |
| loadUrl       |   Yes    | string    | None          | StarRocks FE address used for Stream Load[1]; multiple FE addresses can be specified, in the form `fe_ip:fe_http_port` |
| maxBatchRows  |    No    | int       | 500000        | Maximum number of rows per Stream Load import                                  |
| maxBatchSize  |    No    | int       | 104857600     | Maximum number of bytes per Stream Load import                                 |
| flushInterval |    No    | int       | 300000        | Interval between the end of one Stream Load and the start of the next, in milliseconds |
| loadProps     |    No    | map       |               | Request parameters for Stream Load, see the [Stream Load page][1] for details  |

[1]: https://docs.starrocks.com/zh-cn/main/loading/StreamLoad

## Type Conversion

By default, all incoming values are converted to strings, joined with `\t` as the column separator and `\n` as the row delimiter, and uploaded as a `csv` file through Stream Load.
To change the column separator, configure `loadProps` accordingly:

```json
"loadProps": {
    "column_separator": "\\x01",
    "row_delimiter": "\\x02"
}
```

To change the import format to `json`, configure `loadProps` accordingly:

```json
"loadProps": {
    "format": "json",
    "strip_outer_array": true
}
```
