# FTP Writer

FTP Writer provides the ability to write files to remote FTP/SFTP servers, and currently only writing text files is supported.

## Configuration Example

<<<@/public/assets/jobs/ftpwriter.json

## Parameters

| Configuration  | Required | Data Type | Default Value   | Description                                                                                                                                                                                                                   |
| :------------- | :------: | --------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| protocol       | Yes      | string    | `ftp`           | Server protocol, the currently supported transport protocols are ftp and sftp                                                                                                                                                 |
| host           | Yes      | string    | None            | Server address                                                                                                                                                                                                                |
| port           | No       | int       | 22/21           | Defaults to 21 for ftp and 22 for sftp                                                                                                                                                                                        |
| timeout        | No       | int       | `60000`         | Connection timeout for the ftp server, in milliseconds (ms)                                                                                                                                                                   |
| connectPattern | No       | string    | `PASV`          | Connection mode, only `PORT` and `PASV` are supported. Used with the ftp protocol                                                                                                                                             |
| username       | Yes      | string    | None            | Username                                                                                                                                                                                                                      |
| password       | Yes      | string    | None            | Access password                                                                                                                                                                                                               |
| useKey         | No       | boolean   | false           | Whether to log in with a private key, only valid for sftp login                                                                                                                                                               |
| keyPath        | No       | string    | `~/.ssh/id_rsa` | Private key address                                                                                                                                                                                                           |
| keyPass        | No       | string    | None            | Private key password; no need to configure this item if no private key password is set                                                                                                                                        |
| path           | Yes      | string    | None            | Path information of the remote FTP file system, FtpWriter writes multiple files under the `path` directory                                                                                                                    |
| fileName       | Yes      | string    | None            | Name of the file to write, a random suffix is appended to this name to form the actual filename written by each thread                                                                                                        |
| writeMode      | Yes      | string    | None            | Data cleanup processing mode before writing, see below                                                                                                                                                                        |
| fieldDelimiter | Yes      | string    | `,`             | Field delimiter for reading                                                                                                                                                                                                   |
| compress       | No       | string    | None            | Text compression type, supports `zip`, `gzip`, `bzip2`, `xz`, `zstd`, `lzma`, `deflate`, `lz4-framed`, `lz4-block`, `snappy-framed`, `pack200`; the extension of the compressed file (e.g. `.gz`) is appended to the filename |
| encoding       | No       | string    | `utf-8`         | Encoding configuration for reading files                                                                                                                                                                                      |
| dateFormat     | No       | string    | None            | Format used when serializing date type data into the file, e.g. `"yyyy-MM-dd"`                                                                                                                                                |
| fileFormat     | No       | string    | `text`          | Format of the written file, either csv or text                                                                                                                                                                                |
| header         | No       | list      | None            | Header used for text output, example `['id', 'name', 'age']`                                                                                                                                                                  |
| nullFormat     | No       | string    | `\N`            | Define which strings can represent null                                                                                                                                                                                       |

### writeMode

Description: the data cleanup processing mode of the FtpWriter before writing:

1. `truncate`, clean up all files with the `fileName` prefix under the directory before writing (subdirectories are skipped).
2. `append`, no cleanup is performed before writing, the Addax FtpWriter writes directly with `fileName` and guarantees that filenames do not conflict (if the target filename already exists, a random string is inserted into the name and the data is written to that new filename).
3. `nonConflict`, if files with the `fileName` prefix exist under the directory, an error is reported directly.

### Authentication

Since version `4.0.2`, logging in to an SFTP server with private key authentication is supported; if both the password and the private key are configured, both authentication methods are attempted.
Note that if the `keyPath` and `keyPass` items are configured but `useKey` is set to `false`, the plugin still will not attempt to log in with the private key.

## Type Conversion

FTP files themselves do not provide data types; the types are defined by the Addax FtpWriter:

| Addax Internal Type | FTP File Data Type                          |
| ------------------- | ------------------------------------------- |
| Long                | Long -> serialized string representation    |
| Double              | Double -> serialized string representation  |
| String              | String -> serialized string representation  |
| Boolean             | Boolean -> serialized string representation |
| Date                | Date -> serialized string representation    |
| Bytes               | Base64 string                               |

## Binary Columns

As with [TxtFile Writer](txtfilewriter), a `Bytes` type (Oracle's `BLOB`/`RAW`, MySQL's `BLOB`/`VARBINARY`, etc.) is written as a Base64
string and is not decoded into text according to `encoding`; a SQL NULL is still represented by `nullFormat`.
