# HDFS Reader

HDFS Reader provides the ability to read data from the distributed file system Hadoop HDFS.

Currently HdfsReader supports the following file formats:

- textfile（text）
- orcfile（orc）
- rcfile（rc）
- sequence file（seq）
- Csv(csv)
- parquet

## Features and Limitations

1. Supports textfile, orcfile, parquet, rcfile, sequence file and csv format files, and requires that the file content stores a logically two-dimensional table.
2. Supports reading multiple types of data (represented using String), supports column pruning, supports column constants
3. Supports recursive reading and wildcards (`*` and `?`).
4. Supports common compression algorithms, including GZIP, SNAPPY, ZLIB, etc.
5. Multiple Files can support concurrent reading.
6. Supports sequence file data compression, currently supports lzo compression method.
7. csv type supports compression formats: gzip, bz2, zip, lzo, lzo_deflate, snappy.
8. Currently the Hive version in the plugin is `3.1.1`, Hadoop version is `3.1.1`, reads work in Hadoop `2.7.x`, Hadoop `3.1.x` and Hive `2.x`, Hive `3.1.x` test environments; other versions are theoretically supported, but please test further before using in production environments;
9. Supports `kerberos` authentication

## Configuration Example

<<<@/public/assets/jobs/hdfsreader.json

## Configuration Parameters

| Configuration          | Required | Data Type   | Default Value | Description                                                                                                                  |
| :--------------------- | :------: | ----------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| path                   |   Yes    | string      | None          | File path to read                                                                                                            |
| defaultFS              |   Yes    | string      | None          | HDFS `NAMENODE` node address, if HA mode is configured, it is the value of `defaultFS`                                       |
| fileType               |   Yes    | string      | None          | File type                                                                                                                    |
| column                 |   Yes    | `list<map>` | None          | List of fields to read                                                                                                       |
| fieldDelimiter         |    No    | char        | `,`           | Specify text file field delimiter, binary files do not need to specify this                                                  |
| encoding               |    No    | string      | `utf-8`       | File encoding configuration, currently only supports `utf-8`                                                                 |
| nullFormat             |    No    | string      | None          | Characters that can represent null, if user configures: `"\\N"`, then if source data is `"\N"`, it's treated as `null` field |
| haveKerberos           |    No    | boolean     | None          | Whether to enable Kerberos authentication, if enabled, need to configure the following two items                             |
| kerberosKeytabFilePath |    No    | string      | None          | Kerberos authentication credential file path, e.g. `/your/path/addax.service.keytab`                                         |
| kerberosPrincipal      |    No    | string      | None          | Kerberos authentication credential principal, e.g. `addax/node1@WGZHAO.COM`                                                  |
| compress               |    No    | string      | None          | Specify compression format of files to read                                                                                  |
| hadoopConfig           |    No    | map         | None          | Used to configure advanced Hadoop-related parameters, such as HA configuration                                               |
| hdfsSitePath           |    No    | string      | None          | Path to `hdfs-site.xml`, detailed explanation below                                                                          |

### path

File path to read. Multiple files can be read, and wildcards such as `*` are supported. Multiple paths may be configured:

1. When a single HDFS file is specified, HdfsReader can only extract data with a single thread for now. Multi-threaded reading of a single non-compressed file is planned for a later release.
2. When multiple HDFS files are specified, HdfsReader supports multi-threaded extraction. The number of concurrent threads is controlled by the number of channels.
3. When a wildcard is specified, HdfsReader tries to enumerate the matching files. For example, `/*` reads every file under `/`, and `/bazhen/*` reads every file under the `bazhen` directory. HdfsReader currently only supports `*` and `?` as file wildcards.

Note that Addax treats all files synchronized in one job as a single table. You must ensure that every file fits the same schema and that Addax has read permission on it.

### fileType

Description: file type. The following values are supported:

- text means `textfile` format
- orc means `orcfile` format
- rc means `rcfile` format
- seq means `sequence file` format
- csv means plain HDFS file format (logical two-dimensional table)
- parquet means `parquet` format

Note that HdfsReader can detect automatically whether a file is `orcfile`, `textfile` or another type, but this option is required. When set, HdfsReader only reads files of the configured type and ignores files of other formats under the path.

Since `textfile` and `orcfile` are two completely different file formats, HdfsReader parses them differently. As a result, the complex composite types supported by Hive (such as map, array, struct and union) are rendered slightly differently when converted to the supported String type. Take the map type as an example:

- `orcfile`: a map converted to string results in `{job=80, team=60, person=70}`

- `textfile`: a map converted to string results in `job:80,team:60,person:70`

As the results show, the data itself is unchanged but the representation differs. If the fields to synchronize are composite types in Hive, configure a single file format for the whole path.

If you need a uniform representation for composite types, export the `textfile` table to an `orcfile` table from the Hive client.

### column

List of fields to read. `type` specifies the type of the source data, `index` specifies which column of the text the current column comes from (starting at 0), and `value` specifies a constant: instead of reading from the source file, the column is generated from the `value` automatically.

By default all columns can be read as String, configured as follows:

```json
{
  "column": ["*"]
}
```

You can also specify the column fields explicitly, for example:

```json
[
  {
    "type": "long",
    "index": 0,
    "description": "Read an int from the first column of the HDFS file"
  },
  {
    "type": "string",
    "value": "addax",
    "description": "Generate a string field with the value addax inside HdfsReader as the current column"
  }
]
```

When you specify `column` explicitly, `type` is required and exactly one of `index` or `value` must be set.

### compress

Compression format for files when `fileType` is csv. Only gzip, bz2, zip, lzo, lzo_deflate, hadoop-snappy and framing-snappy are supported.

Note that LZO has two compression formats, `lzo` and `lzo_deflate`, so choose carefully when configuring.

Because Snappy has no single stream format, Addax supports the two most common ones: `hadoop-snappy` (Hadoop's snappy stream format) and `framing-snappy` (Google's recommended snappy stream format).

### hadoopConfig

`hadoopConfig` can be used to provide advanced Hadoop-related parameters, such as HA settings:

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

Here `cluster` is the name under which HDFS is configured for HA, and it is also the name used in `defaultFS`. If the actual cluster name is not `cluster`, replace every occurrence of `cluster` in the configuration above.

### csvReaderConfig

Parameters for reading CSV files, Map type. CSV files are read with CsvReader, which has many options; when the map is omitted the defaults are used.

Common configuration:

```json
{
  "csvReaderConfig": {
    "safetySwitch": false,
    "skipEmptyRecords": false,
    "useTextQualifier": false
  }
}
```

All configuration items and their default values. In the `csvReaderConfig` map you must **use exactly the following field names**:

```ini
boolean caseSensitive = true;
char textQualifier = 34;
boolean trimWhitespace = true;
boolean useTextQualifier = true;// whether to use the CSV escape character
char delimiter = 44;// field delimiter
char recordDelimiter = 0;
char comment = 35;
boolean useComments = false;
int escapeMode = 1;
boolean safetySwitch = true;// whether to limit a single column to 100000 characters
boolean skipEmptyRecords = true;// whether to skip empty lines
boolean captureRawRecord = true;
```

### hdfsSitePath

This option was introduced in `4.2.4` and specifies the path of the `hdfs-site.xml` file. For HDP/CDH, for example, it can be configured as follows:

```json
{
  "hdfsSitePath": "/etc/hadoop/conf/hdfs-site.xml"
}
```

When `hdfsSitePath` is configured, the plugin obtains the configuration required to access the HDFS file system from that file, so in most cases `hadoopConfig` is no longer needed and the configuration is smaller.

This approach is recommended when Addax is deployed on a Hadoop cluster.

## Type Conversion

| Addax Internal Type | Hive Table Data Type                                     |
| ------------------- | -------------------------------------------------------- |
| Long                | TINYINT, SMALLINT, INT, BIGINT                           |
| Double              | FLOAT, DOUBLE                                            |
| String              | String, CHAR, VARCHAR, STRUCT, MAP, ARRAY, UNION, BINARY |
| Boolean             | BOOLEAN                                                  |
| Date                | Date, TIMESTAMP                                          |
| Bytes               | BINARY                                                   |

Where:

- Long means the text of the HDFS file represents an integer as a string, for example `123456789`
- Double means the text represents a Double as a string, for example `3.1415`
- Boolean means the text represents a Boolean as a string, for example `true` or `false`. Case-insensitive.
- Date means the text represents a Date as a string, for example `2014-12-31`
- Bytes means content stored in binary form in HDFS, for example the data of an image

Special note:

- The Hive type TIMESTAMP is precise to nanoseconds, so `TIMESTAMP` values in `textfile` and `orcfile` look like `2015-08-21 22:40:47.397898389`. If they are converted to Addax's Date type, the nanosecond part is lost. Configure the type as `String` if you need to keep it.

## FAQ

Q: If you see `java.io.IOException: Maximum column length of 100,000 exceeded in column...`, the column field in the data source is longer than 100000 characters.

A: Add the following configuration to the reader section of the job:

```json
{
  "csvReaderConfig": {
    "safetySwitch": false,
    "skipEmptyRecords": false,
    "useTextQualifier": false
  }
}
```

`safetySwitch = false` removes the 100000 character limit on a single column.
