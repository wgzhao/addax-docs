# FTP Writer

FTP Writer provides the ability to write files to remote FTP/SFTP servers, currently only supports writing text files.

## Configuration Example

<<<@/public/assets/jobs/ftpwriter.json

## Parameters

| Configuration  | Required | Data Type | Default Value   | Description                                                                                                                                                                                                     |
| :------------- | :------: | --------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| protocol       |   Yes    | string    | `ftp`           | Server protocol, currently supports ftp and sftp transport protocols                                                                                                                                            |
| host           |   Yes    | string    | None            | Server address                                                                                                                                                                                                  |
| port           |    No    | int       | 22/21           | FTP default is 21, SFTP default is 22                                                                                                                                                                           |
| timeout        |    No    | int       | `60000`         | Connection timeout for FTP server, in milliseconds (ms)                                                                                                                                                         |
| connectPattern |    No    | string    | `PASV`          | Connection mode, only supports `PORT`, `PASV` modes. Used for FTP protocol                                                                                                                                      |
| username       |   Yes    | string    | None            | Username                                                                                                                                                                                                        |
| password       |   Yes    | string    | None            | Access password                                                                                                                                                                                                 |
| useKey         |    No    | boolean   | false           | Whether to use private key login, only valid for SFTP login                                                                                                                                                     |
| keyPath        |    No    | string    | `~/.ssh/id_rsa` | Private key address                                                                                                                                                                                             |
| keyPass        |    No    | string    | None            | Private key password, no need to configure if no private key password is set                                                                                                                                    |
| path           |   Yes    | string    | None            | Remote FTP file system path information, FtpWriter will write multiple files under Path directory                                                                                                               |
| fileName       |   Yes    | string    | None            | Name of file to write, this filename will have random suffix added as actual filename for each thread                                                                                                           |
| writeMode      |   Yes    | string    | None            | Data cleanup processing mode before writing, see below                                                                                                                                                          |
| fieldDelimiter |   Yes    | string    | `,`             | Field delimiter for reading                                                                                                                                                                                     |
| compress       |    No    | string    | None            | Text compression type: `zip`, `gzip`, `bzip2`, `xz`, `zstd`, `lzma`, `deflate`, `lz4-framed`, `lz4-block`, `snappy-framed` or `pack200`; the codec's extension (for example `.gz`) is appended to the file name |

### writeMode

Description: the data cleanup mode of the FtpWriter before writing:

1. `truncate`, clean up all files with the `fileName` prefix under the directory before writing (sub directories are skipped).
2. `append`, no cleanup is performed before writing, the Addax FtpWriter writes with the filename directly and guarantees that file names do not conflict; when the target file name already exists, a random string is inserted into the name and the data goes to that new file.
3. `nonConflict`, if files with the `fileName` prefix exist under the directory, the job fails.

## Binary columns

As in [TxtFile Writer](txtfilewriter), a `Bytes` column (Oracle `BLOB`/`RAW`, MySQL `BLOB`/`VARBINARY`, and so on) is written as a
base64 string instead of being decoded with `encoding`; a SQL NULL still renders as `nullFormat`.
