# HDFS Writer

HDFS Writer provides the ability to write files in formats like `TextFile`, `ORCFile`, `Parquet` etc. to specified paths in HDFS file system. File content can be associated with tables in Hive.

## Configuration Example

<<<@/public/assets/jobs/hdfswriter.json

## Parameters

| Configuration          | Required | Data Type   | Default Value | Description                                                                                                                |
| :--------------------- | :------: | ----------- | ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| path                   |   Yes    | string      | None          | File path to read                                                                                                          |
| defaultFS              |   Yes    | string      | None          | Detailed description below                                                                                                 |
| fileType               |   Yes    | string      | None          | File type, detailed description below                                                                                      |
| fileName               |   Yes    | string      | None          | Filename to write, used as prefix                                                                                          |
| column                 |   Yes    | `list<map>` | None          | List of fields to write                                                                                                    |
| writeMode              |   Yes    | string      | None          | Write mode, detailed description below                                                                                     |
| skipTrash              |    No    | boolean     | false         | Whether to skip trash, related to `writeMode` configuration                                                                |
| fieldDelimiter         |    No    | string      | `,`           | Field delimiter for text files, not needed for binary files                                                                |
| encoding               |    No    | string      | `utf-8`       | File encoding configuration, currently only supports `utf-8`                                                               |
| nullFormat             |    No    | string      | None          | Define characters representing null, e.g. if user configures `"\\N"`, then if source data is `"\N"`, treat as `null` field |
| haveKerberos           |    No    | boolean     | false         | Whether to enable Kerberos authentication, if enabled, need to configure the following two items                           |
| kerberosKeytabFilePath |    No    | string      | None          | Credential file path for Kerberos authentication, e.g. `/your/path/addax.service.keytab`                                   |
| kerberosPrincipal      |    No    | string      | None          | Credential principal for Kerberos authentication, e.g. `addax/node1@WGZHAO.COM`                                            |
| compress               |    No    | string      | None          | File compression format, see below                                                                                         |
| hadoopConfig           |    No    | map         | None          | Can configure some advanced parameters related to Hadoop, such as HA configuration                                         |
| preShell               |    No    | `list`      | None          | Shell commands to execute before writing data, e.g. `hive -e "truncate table test.hello"`                                  |
| postShell              |    No    | `list`      | None          | Shell commands to execute after writing data, e.g. `hive -e "select count(1) from test.hello"`                             |
| ignoreError            |    No    | boolean     | false         | Whether to ignore errors from `preShell` and `postShell` commands                                                           |
| hdfsSitePath           |    No    | string      | None          | Path to `hdfs-site.xml`, see explanation below                                                                              |
| createPath             |    No    | boolean     | false         | Whether to create the target path if it does not exist (default: no; the task will fail by default)                         |
| bloomColumns           |    No    | list        | None          | List of column names for which to create a bloom filter (effective only when `fileType` is `orc`)                            |
| bloomFpp               |    No    | double      | 0.05          | False positive probability for the bloom filter (effective only when `fileType` is `orc`)                                     |

### Path

The HDFS path where data will be stored. HdfsWriter will write multiple files under the configured `path` directory according to the concurrency settings. To associate the output with a Hive table, specify the Hive table's storage path on HDFS. For example, if the Hive warehouse path is `/user/hive/warehouse/`, database `test` and table `hello`, the storage path would be `/user/hive/warehouse/test.db/hello`. (If the table was created with a `location` property, use that location instead.)

### defaultFS

The NameNode address for the Hadoop HDFS filesystem. Format: `hdfs://ip:port`, for example `hdfs://127.0.0.1:9000`. If HA is enabled, use the service name (e.g. `hdfs://sandbox`).

### fileType

File type. Supported values:

- `text` — Text file format
- `orc` — ORC file format
- `parquet` — Parquet file format
- `rc` — RCFile format
- `seq` — SequenceFile format
- `csv` — Plain HDFS CSV-like (logical 2D table)

### column

The list of fields to write. Partial column writes are not supported — to associate with a Hive table you must specify all field names and types. Each column entry uses `name` for the column name and `type` for the Hive type.

Example:

```json
{
 "column": [
  {
   "name": "userName",
   "type": "string"
  },
  {
   "name": "age",
   "type": "long"
  },
  {
   "name": "salary",
   "type": "decimal(8,2)"
  }
 ]
}
```

Notes for `decimal` type:

1. If precision and scale are not specified, the default `decimal(38,10)` is used.
2. If only precision is specified but not scale, scale defaults to 0 (i.e. `decimal(p,0)`).
3. If both precision and scale are specified, use `decimal(p,s)` as provided.

Since `5.0.1`, compound types `array` and `map` are supported.

### writeMode

Controls how existing data under the target path is handled before writing:

- `append`: Do not remove existing data; write using the configured `fileName` and ensure no filename conflicts.
- `overwrite`: If the target directory contains data, delete it first, then write.
- `nonConflict`: If files with the `fileName` prefix already exist in the directory, fail with an error.

### skipTrash

When `writeMode` is `overwrite`, this option controls whether deleted files/folders are moved to the HDFS trash. By default deletions go to the trash; set `skipTrash` to `true` to delete directly.

Implementation detail: Addax checks the Hadoop `fs.trash.interval` parameter. If it is unset or set to 0, Addax will set it to `10080` (7 days) so that trashed files are retained for seven days. This behavior gives a recovery window for data mistakenly deleted during jobs.

#### compress

When `fileType` is `csv`, supported compression formats are: `gzip`, `bz2`, `zip`, `lzo`, `lzo_deflate`, `hadoop-snappy`, `framing-snappy`.

Note: LZO has two stream formats: `lzo` and `lzo_deflate`; be careful to select the correct one. Also, Snappy currently has multiple stream formats — Addax supports the two most common formats: `hadoop-snappy` (Hadoop's snappy stream format) and `framing-snappy` (the Google-recommended framing format).

### hadoopConfig

`hadoopConfig` can be used to provide advanced Hadoop configuration, for example HA settings:

```json
{
 "hadoopConfig": {
  "dfs.nameservices": "cluster",
  "dfs.ha.namenodes.cluster": "nn1,nn2",
  "dfs.namenode.rpc-address.cluster.nn1": "node1.example.com:8020",
  "dfs.namenode.rpc-address.cluster.nn2": "node2.example.com:8020",
  "dfs.client.failover.proxy.provider.cluster": "org.apache.hadoop.hdfs.server.namenode.ha.ConfiguredFailoverProxyProvider"
 }
}
```

Here `cluster` is the HA nameservice name and should match the value used in `defaultFS`. If your environment uses a different nameservice identifier, replace `cluster` accordingly in the configuration keys above.

### preShell and postShell

`preShell` and `postShell` allow you to run shell commands before and after data writing. Typical uses include truncating a table before loading or checking row counts after loading. For example, to add a partition before writing you might use:

```
hive -e "alter table test.hello add partition(dt='${logdate}')"
```

### ignoreError

Controls whether errors from `preShell` and `postShell` commands should be ignored. If `true`, failures in these commands do not cause the job to fail — errors are logged and execution continues. If `false`, failures of `preShell`/`postShell` will cause the job to fail.

### hdfsSitePath

Introduced in `4.2.4`, `hdfsSitePath` specifies the path to an `hdfs-site.xml` file, for example:

```json
{
 "hdfsSitePath": "/etc/hadoop/conf/hdfs-site.xml"
}
```

If `hdfsSitePath` is set, the plugin will read the necessary HDFS configuration from that file, often removing the need to populate `hadoopConfig` manually. This approach is recommended when Addax is deployed within a Hadoop cluster.

## Bloom filter

The `bloomColumns` and `bloomFpp` parameters were added in `6.0.10` and apply only when `fileType` is `orc`. They control creating bloom filters in ORC files to improve query performance. `bloomColumns` lists column names to create bloom filters for; `bloomFpp` sets the false-positive probability (default `0.05`).

Example:

```json
{
 "fileType": "orc",
 "bloomColumns": ["userName", "age"],
 "bloomFpp": 0.01
}
```

## Short-circuit issue

If you encounter a warning like the following when running a job:

```shell
WARN shortcircuit.DomainSocketFactory: The short-circuit local reads feature cannot be used because libhadoop cannot be loaded.
```

This indicates that the Hadoop native libraries are missing, which prevents the short-circuit local reads feature from being used. This feature can improve local read performance for HDFS files but is not strictly required.

You can resolve this issue in one of two ways:

1. Add the Hadoop native library path to the `LD_LIBRARY_PATH` environment variable, for example:

```shell
## for HDP distribution
export LD_LIBRARY_PATH=/usr/hdp/current/hadoop-client/lib/native:$LD_LIBRARY_PATH
## for CDH distribution
export LD_LIBRARY_PATH=/opt/cloudera/parcels/CDH/lib/hadoop/lib/native:$LD_LIBRARY_PATH
```

1. Or pass the `-Djava.library.path` parameter to the `addax.sh` script, for example:

```shell
bin/addax.sh -j  "-Djava.library.path=/usr/hdp/current/hadoop-client/lib/native" <your_job.json>
```

## Type mapping

| Addax internal type | HIVE data type                                   |
| ------------------- | ------------------------------------------------ |
| Long                | TINYINT, SMALLINT, INT, INTEGER, BIGINT          |
| Double              | FLOAT, DOUBLE, DECIMAL                           |
| String              | STRING, VARCHAR, CHAR                            |
| Boolean             | BOOLEAN                                          |
| Date                | DATE, TIMESTAMP                                  |
| Bytes               | BINARY                                           |
| String              | ARRAY, MAP                                       |

## Features and limitations

1. Currently not supported: `structs`, `union` types.
