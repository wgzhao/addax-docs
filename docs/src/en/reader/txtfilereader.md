# TxtFile Reader

TxtFile Reader provides the ability to read data from the local file system.

## Configuration Example

<<<@/public/assets/jobs/txtreader.json

## Parameters

| Parameter       | Required | Data Type      | Default | Description                                                                                              |
| :-------------- | :------: | -------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| path            |   Yes    | list           | None    | Path information of the local file system. Note that multiple paths can be filled in here. See below for details |
| column          |   Yes    | `list<map>\|*` | None    | List of fields to read. `type` specifies the type of the source data. See below for details              |
| fieldDelimiter  |   Yes    | string         | `,`     | Description: field delimiter for reading                                                                 |
| encoding        |    No    | string         | utf-8   | Encoding configuration for reading the file                                                              |
| skipHeader      |    No    | boolean        | false   | CSV-like files may have a header as the title, which needs to be skipped. Not skipped by default           |
| csvReaderConfig |    No    | string         | None    | Configuration parameters for reading CSV-type files, Map type. If not configured, the default values are used. See below for details |

### path

Path information of the local file system. Note that multiple paths can be filled in here.

- When a single local file is specified, TxtFileReader can currently only use a single thread for data extraction. The second phase considers multi-threaded concurrent reading for a single File in the case of non-compressed files
- When multiple local files are specified, TxtFileReader supports multi-threaded data extraction. The number of concurrent threads is specified by the number of channels
- When a wildcard is specified, TxtFileReader attempts to iterate out the information of multiple files. For example: specifying `/*` means reading all files under the `/` directory, and specifying `/bazhen/*` means reading all files downstream of the `bazhen` directory. Currently only `*` is supported as a file wildcard.

Special note: Addax treats all Text Files synchronized under one job as the same data table. Users must ensure that all Files can adapt to the same set of schema information. The files read by users must be in CSV-like format, and Addax must be granted read permission.

Special note: if there is no file matching the extraction criteria under the path specified by Path, Addax will report an error.

Starting from version 3.2.3, `path` allows mixing files of different compression formats. The plugin attempts to automatically guess the compression format and decompress them automatically. Currently supported compression formats are:

- zip
- bzip2
- gzip
- LZ4
- PACK200
- XZ
- Compress

### column

List of fields to read. `type` specifies the type of the source data, `index` specifies which column of the text the current column comes from (starting from 0), and `value` specifies that the current type is a constant, which does not read data from the source file but automatically generates the corresponding column according to the value.

By default, users can read all data as the String type, configured as follows:

```json
{
  "column": ["*"]
}
```

Users can specify Column field information as follows:

```json
[
  {
    "type": "long",
    "index": 0
  },
  {
    "type": "string",
    "value": "alibaba"
  }
]
```

For user-specified Column information, `type` must be filled in, and one of `index`/`value` must be selected.

Starting from `4.0.1`, in addition to using `index` to specify the order of fields, the `name` method is also supported. This requires that all the files being read contain a file header. The plugin will try to match the specified `name` against the file header read from the file, then obtain the corresponding `index` value and write it back to the configuration file. At the same time, `index` and `name` can be mixed on different columns, for example as follows:

```json
[
  {
    "type": "long",
    "index": 0
  },
  {
    "name": "region",
    "type": "string"
  },
  {
    "type": "string",
    "value": "alibaba"
  }
]
```

Note: This approach means that the file will be read during the preparation phase, so there will be a certain performance loss. If not necessary, it is not recommended to configure the `name` method.

### csvReaderConfig

Configuration parameters for reading CSV-type files, Map type. Reading CSV-type files uses CsvReader, which has many configurations. If not configured, the default values are used.

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

All configuration items and default values. When configuring, please **configure strictly according to the following field names** in the csvReaderConfig map:

```ini
boolean caseSensitive = true;
char textQualifier = 34;
boolean trimWhitespace = true;
boolean useTextQualifier = true;//whether to use csv escape character
char delimiter = 44;//delimiter
char recordDelimiter = 0;
char comment = 35;
boolean useComments = false;
int escapeMode = 1;
boolean safetySwitch = true;//whether the single column length is limited to 100000 characters
boolean skipEmptyRecords = true;//whether to skip empty lines
boolean captureRawRecord = true;
```

## Type Conversion

| Addax Internal Type | Local File Data Type |
| ------------------- | -------------------- |
| Long                | Long                 |
| Double              | Double               |
| String              | String               |
| Boolean             | Boolean              |
| Date                | Date                 |
