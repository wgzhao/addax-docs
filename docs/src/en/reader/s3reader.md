# S3 Reader

S3 Reader plugin is used to read data on Amazon AWS S3 storage. In implementation, this plugin is written based on S3's official [SDK 2.0](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/home.html).

This plugin also supports reading storage services compatible with S3 protocol, such as [MinIO](https://min.io/)

## Configuration Example

The following sample configuration reads two files from S3 storage and prints them out

<<<@/public/assets/jobs/s3reader.json

## Parameters

| Configuration          | Required | Data Type | Default Value | Description                                                                                       |
| :--------------------- | :------: | --------- | ------------- | ------------------------------------------------------------------------------------------------- |
| endpoint               |    No    | string    | None          | S3 Server EndPoint address, e.g. `s3.xx.amazonaws.com`; derived from `region` when left empty     |
| region                 |   Yes    | string    | None          | S3 Server Region address, e.g. `ap-southeast-1`                                                   |
| accessId               |   Yes    | string    | None          | Access ID                                                                                         |
| accessKey              |   Yes    | string    | None          | Access Key                                                                                        |
| bucket                 |   Yes    | string    | None          | Bucket to read                                                                                    |
| object                 |   Yes    | list      | None          | Objects to read, can specify multiple entries and wildcard patterns, see below                    |
| column                 |   Yes    | list      | None          | Column information of the objects to read, see the `column` description in [RDBMS Reader][1]      |
| fieldDelimiter         |    No    | string    | `,`           | Field delimiter for reading, only a single character is supported                                 |
| compress               |    No    | string    | None          | File compression format; detected from the file content when left empty                           |
| fileFormat             |    No    | string    | None          | File format, only `csv` and `text` are supported; any other value fails the job                   |
| encoding               |    No    | string    | `utf8`        | File encoding format                                                                              |
| pathStyleAccessEnabled |    No    | boolean   | false         | Whether to enable path-style access mode                                                          |

[1]: rdbmsreader

### endpoint

Optional. Required for S3 compatible services (MinIO, Ceph, etc.); it can be left empty for the official AWS service, and the client then derives the access address from `region`.

### object

When a single object is specified, the plugin can currently only use single-threaded data extraction.

When multiple objects are specified, the plugin splits them into several groups according to the number of channels and reads them in parallel, with each group sharing one client connection.

Only `*` (any number of characters) and `?` (one character) are wildcards; all other characters are ordinary characters in the object name, including `.`:

- `data/*.csv` only matches `data/a.csv` and does not match `data/foo1csv`
- the `+` in `data+old/*.csv` is a literal and is not treated as a regex repetition operator

Matched objects are deduplicated and sorted; when the same object is covered by multiple entries, it is read only once.

If a name specified in `object` does not exist in the bucket (a wildcard matches no object, or the name is misspelled), the job fails immediately instead of producing an empty result.

### compress

When it is not configured, the plugin recognizes the compression format from the magic number at the beginning of the file (gzip, bzip2, xz, zstd, etc.; `.zip`/`.lzo` are recognized by suffix) and decompresses automatically; a configured value takes precedence. An explicit `none` means reading the file as it is without any decompression.

### pathStyleAccessEnabled

Whether to enable path-style access. When enabled, a bucket is accessed via the path `example.com/bucket-name`, otherwise via `bucket-name.example.com`. See [path vs virtual access](https://min.io/docs/minio/linux/administration/object-management.html#minio-object-management-path-virtual-access) for details.

## Type Conversion

The data read is text content, and the type of each field is determined by the `type` configured in `column`; see the `column` description in [RDBMS Reader][1] for how to fill it in. When `column` is set to `["*"]`, all fields are read as strings.

## Limitations

1. Only text files (csv / text) can be read
2. Only static AccessKey / AccessKeyId is supported; IAM Role, environment variables, profile or temporary credentials are not supported
3. Encrypted (password-protected) objects are not supported
