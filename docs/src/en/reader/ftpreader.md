# FTP Reader

FTP Reader provides the ability to read data from remote FTP/SFTP file systems.

## Functionality

### Configuration Example

<<<@/public/assets/jobs/ftpreader.json

### Parameters

| Configuration     | Required | Data Type   | Default Value   | Description                                                                                                                                                 |
| :---------------- | :------: | ----------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| protocol          |   Yes    | string      | None            | Server protocol, currently supports `ftp` and `sftp` transport protocols                                                                                    |
| host              |   Yes    | string      | None            | Server address                                                                                                                                              |
| port              |    No    | int         | 22/21           | If transport protocol is `sftp`, default is 22; if standard ftp protocol, default is 21                                                                     |
| timeout           |    No    | int         | 60000           | Connection timeout for ftp server, in milliseconds (ms)                                                                                                     |
| connectPattern    |    No    | string      | PASV            | Connection mode, only supports `PORT`, `PASV` modes. This parameter is only used for ftp protocol                                                           |
| username          |   Yes    | string      | None            | FTP server access username                                                                                                                                  |
| password          |    No    | string      | None            | FTP server access password                                                                                                                                  |
| useKey            |    No    | boolean     | false           | Whether to use private key login, only valid for sftp login                                                                                                 |
| keyPath           |    No    | string      | `~/.ssh/id_rsa` | Private key address                                                                                                                                         |
| keyPass           |    No    | string      | None            | Private key password, if no private key password is set, no need to configure this                                                                          |
| path              |   Yes    | list        | None            | Remote FTP file system paths, every path must be absolute; only the last segment may carry `*` (any characters) or `?` (one character) wildcards, see below |
| column            |   Yes    | `list<map>` | None            | List of fields to read, type specifies the type of source data, see below                                                                                   |
| fieldDelimiter    |   Yes    | string      | `,`             | Field delimiter for reading                                                                                                                                 |
| compress          |    No    | string      | None            | Text compression type, default empty means no compression. Supports `zip`, `gz`, `bzip2`                                                                    |
| encoding          |    No    | string      | `utf-8`         | File encoding configuration for reading                                                                                                                     |
| skipHeader        |    No    | boolean     | false           | CSV-like files may have a header row that must be skipped. Not skipped by default                                                                           |
| nullFormat        |    No    | char        | `\N`            | Defines which strings can represent null                                                                                                                    |
| maxTraversalLevel |    No    | int         | 100             | Maximum number of folder levels allowed for traversal                                                                                                       |
| csvReaderConfig   |    No    | map         | None            | Parameters for reading CSV files, Map type. Default values are used when not configured, see below                                                          |

#### path

Remote FTP file system paths. Multiple paths are supported, and the example below shows how to configure them.

```json
{
  "path": [
    "/var/ftp/test.txt", // read the /var/ftp/test.txt file
    "/var/tmp/*.txt", // read every .txt file under /var/tmp
    "/public/ftp", // read every file under /public/ftp; if /public/ftp is a file, read it directly
    "/public/a??.txt" // read files under /public whose name starts with "a", followed by two characters and the .txt suffix
  ]
}
```

Every path must be absolute. Only two wildcards exist: `*` matches any number of characters and `?` matches a single character; they only apply to the last segment of the path, and the pattern as a whole is interpreted with Java glob syntax. When no file matches or the path does not exist, a WARN is written to the job log.

::: warning Before you start

- Addax treats all Text Files synchronized in one job as a single table. You must ensure that every file fits the same schema, is CSV-like, and is readable by Addax.
- If no file under the configured path matches, Addax fails the job immediately.
:::

#### column

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
    "description": "Read an int from the first column of the remote FTP file"
  },
  {
    "type": "string",
    "value": "addax",
    "description": "Generate a string field with the value addax inside FTP Reader as the current column"
  }
]
```

When you specify `column` explicitly, `type` is required and exactly one of `index` or `value` must be set.

#### csvReaderConfig

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

### Type Conversion

The remote FTP file itself does not carry data types; the types are defined by Addax FTP Reader:

| Addax Internal Type | Remote FTP File Data Type |
| ------------------- | ------------------------- |
| Long                | Long                      |
| Double              | Double                    |
| String              | String                    |
| Boolean             | Boolean                   |
| Date                | Date                      |

Where:

- Long means the text of the remote FTP file represents an integer as a string, for example "19901219".
- Double means the text represents a Double as a string, for example "3.1415".
- Boolean means the text represents a Boolean as a string, for example "true" or "false". Case-insensitive.
- Date means the text represents a Date as a string, for example "2014-12-31". A `format` can be specified for Date.

## Limitations

1. A single file can be read concurrently by multiple threads, which involves the split algorithm inside a single file.
2. A single compressed file cannot be read concurrently for technical reasons.
