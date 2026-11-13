# S3 Reader

S3 Reader plugin is used to read data on Amazon AWS S3 storage. In implementation, this plugin is written based on S3's official [SDK 2.0](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/home.html).

This plugin also supports reading storage services compatible with S3 protocol, such as [MinIO](https://min.io/).

## Configuration Example

The following sample configuration is used to read two files from S3 storage and print them out

<<<@/public/assets/jobs/s3reader.json

## Parameters

| Configuration          | Required | Data Type | Default Value | Description                                                                                                 |
| :--------------------- | :------: | --------- | ------------- | ----------------------------------------------------------------------------------------------------------- |
| endpoint               |    No    | string    | None          | S3 Server EndPoint address, e.g. `s3.xx.amazonaws.com`; the client derives it from `region` when left empty |
| region                 |   Yes    | string    | None          | S3 Server Region address, e.g. `ap-southeast-1`                                                             |
| accessId               |   Yes    | string    | None          | Access ID                                                                                                   |
| accessKey              |   Yes    | string    | None          | Access Key                                                                                                  |
| bucket                 |   Yes    | string    | None          | Bucket to read                                                                                              |
| object                 |   Yes    | list      | None          | Objects to read, can specify multiple and wildcard patterns, see description below                          |
| column                 |   Yes    | list      | None          | Column information of objects to read, refer to `column` description in [RDBMS Reader][1]                   |
| fieldDelimiter         |    No    | string    | `,`           | Field delimiter for reading, only supports single character                                                 |
| compress               |    No    | string    | None          | Compression format; the content of the object decides it when left empty                                    |
| fileFormat             |    No    | string    | None          | File format, only `csv` and `text` are accepted; any other value fails the job                              |
| encoding               |    No    | string    | `utf8`        | File encoding format                                                                                        |
| pathStyleAccessEnabled |    No    | boolean   | false         | Whether to enable path-style access mode                                                                    |

[1]: rdbmsreader

### endpoint

Optional. An S3 compatible service (MinIO, Ceph, …) has to name its endpoint; against AWS itself the
value can be left empty and the client derives the address from `region`.

### compress

When it is not configured the compression is recognized from the first bytes of the object (gzip,
bzip2, xz, zstd and the rest commons-compress knows, plus `.zip` and `.lzo` by their suffix) and the
object is decompressed. A configured value wins, and an explicit `none` reads the object as it is.

### object

When specifying a single object, the plugin can currently only use single-threaded data extraction.
Multiple objects are spread over the channels, and each group shares one client connection.

Only `*` (any number of characters) and `?` (one character) are wildcards; every other character is a
literal part of the object name, including the dot:

- `data/*.csv` matches `data/a.csv` and not `data/foo1csv`
- the `+` of `data+old/*.csv` is a literal, not a repetition

The keys a pattern matches are deduplicated and sorted, so an object covered by several entries of the
list is read once. An object that does not exist — a pattern that matches nothing, or a misspelled
name — fails the job instead of producing an empty result.
