# S3 Writer

The S3 Writer plugin is used to write data to Amazon AWS S3 storage, as well as to storage compatible with the S3 protocol, such as [MinIO](https://min.io).

In terms of implementation, this plugin is written based on S3's official [SDK 2.0](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/home.html).

## Configuration Example

The following configuration is used to read data from memory and write it to the specified S3 bucket.

<<<@/public/assets/jobs/s3writer.json

## Parameters

| Configuration          | Required | Data Type | Default Value                                              | Description                                                            |
| :--------------------- | :------: | --------- | ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| endpoint               |   Yes    | string    | None                                                       | S3 Server EndPoint address, e.g. `s3.xx.amazonaws.com`                 |
| region                 |   Yes    | string    | None                                                       | S3 Server Region address, e.g. `ap-southeast-1`                        |
| accessId               |   Yes    | string    | None                                                       | Access ID                                                              |
| accessKey              |   Yes    | string    | None                                                       | Access Key                                                             |
| bucket                 |   Yes    | string    | None                                                       | Bucket to write to                                                     |
| object                 |   Yes    | string    | None                                                       | Object to write to, see notes below                                    |
| fieldDelimiter         |    No    | char      | `','`                                                      | Field delimiter                                                        |
| nullFormat             |    No    | char      | `\N`                                                       | What character is used to represent a null value                       |
| header                 |    No    | list      | None                                                       | Header information written to the file, e.g. `["id","title","url"]`    |
| maxFileSize            |    No    | int       | `100000`                                                   | Size of a single object, in MB                                         |
| encoding               |    No    | string    | `utf-8`                                                    | File encoding format                                                   |
| writeMode              |    No    | string    | `append`                                                   | Write mode, see the related description in [hdfswriter](hdfswriter)    |
| pathStyleAccessEnabled |    No    | bool      | false                                                      | Whether to use path access style                                       |
| sslEnabled             |    No    | bool      | true                                                       | Whether to access over SSL                                             |
| fileType               |    No    | string    | `text`                                                     | File type: text, orc, parquet                                          |
| compress               |    No    | string    | orc defaults to `NONE`, parquet defaults to `UNCOMPRESSED` | Compression method for orc or parquet files, no compression by default |

### object

Although the `object` in the above configuration is set to the `upload.csv` file, the file name actually written to S3 will have a `uuid` suffix appended to the specified file name, similar to `upload_c0d2ca7df0444933a6f18ea76718b569.csv`. This is used to ensure that file names do not collide in the case of multi-channel writes.

## Type Conversion

| Addax internal type | S3 data type                                                  |
| ------------------- | ------------------------------------------------------------- |
| Long                | int, tinyint, smallint, mediumint, int, bigint                |
| Double              | float, double, decimal                                        |
| String              | varchar, char, tinytext, text, mediumtext, longtext, year,xml |
| Date                | date, datetime, timestamp, time                               |
| Boolean             | bit, bool                                                     |
| Bytes               | tinyblob, mediumblob, blob, longblob, varbinary               |
