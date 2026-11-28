# HBase20 Reader

The HBase20 Reader plugin reads data from HBase 2.x. It connects to a remote HBase service through the HBase Java client and reads the data within the `rowkey` range you specify using Scan.

## Configuration

The example below is based on the table and data created as follows:

```bash
create 'users', {NAME=>'address', VERSIONS=>100},{NAME=>'info',VERSIONS=>1000}
put 'users', 'lisi', 'address:country', 'china1', 20200101
put 'users', 'lisi', 'address:province',    'beijing1', 20200101
put 'users', 'lisi', 'info:age',        27, 20200101
put 'users', 'lisi', 'info:birthday',   '1987-06-17', 20200101
put 'users', 'lisi', 'info:company',    'baidu1', 20200101
put 'users', 'xiaoming', 'address:city',    'hangzhou1', 20200101
put 'users', 'xiaoming', 'address:country', 'china1', 20200101
put 'users', 'xiaoming', 'address:province',    'zhejiang1',20200101
put 'users', 'xiaoming', 'info:age',        29, 20200101
put 'users', 'xiaoming', 'info:birthday',   '1987-06-17',20200101
put 'users', 'xiaoming', 'info:company',    'alibaba1', 20200101
put 'users', 'lisi', 'address:country', 'china2', 20200102
put 'users', 'lisi', 'address:province',    'beijing2', 20200102
put 'users', 'lisi', 'info:age',        27, 20200102
put 'users', 'lisi', 'info:birthday',   '1987-06-17', 20200102
put 'users', 'lisi', 'info:company',    'baidu2', 20200102
put 'users', 'xiaoming', 'address:city',    'hangzhou2', 20200102
put 'users', 'xiaoming', 'address:country', 'china2', 20200102
put 'users', 'xiaoming', 'address:province',    'zhejiang2', 20200102
put 'users', 'xiaoming', 'info:age',        29, 20200102
put 'users', 'xiaoming', 'info:birthday',   '1987-06-17', 20200102
put 'users', 'xiaoming', 'info:company',    'alibaba2', 20200102
```

### normal mode

The HBase table is read as an ordinary two-dimensional (wide) table, and the latest version of the data is read. For example:

```bash
hbase(main):017:0> scan 'users'
ROW           COLUMN+CELL
 lisi         column=address:city, timestamp=1457101972764, value=beijing
 lisi         column=address:country, timestamp=1457102773908, value=china
 lisi         column=address:province, timestamp=1457101972736, value=beijing
 lisi         column=info:age, timestamp=1457101972548, value=27
 lisi         column=info:birthday, timestamp=1457101972604, value=1987-06-17
 lisi         column=info:company, timestamp=1457101972653, value=baidu
 xiaoming     column=address:city, timestamp=1457082196082, value=hangzhou
 xiaoming     column=address:country, timestamp=1457082195729, value=china
 xiaoming     column=address:province, timestamp=1457082195773, value=zhejiang
 xiaoming     column=info:age, timestamp=1457082218735, value=29
 xiaoming     column=info:birthday, timestamp=1457082186830, value=1987-06-17
 xiaoming     column=info:company, timestamp=1457082189826, value=alibaba
2 row(s) in 0.0580 seconds
```

The data read is:

| rowKey   | addres:city | address:country | address:province | info:age | info:birthday | info:company |
| -------- | ----------- | --------------- | ---------------- | -------- | ------------- | ------------ |
| lisi     | beijing     | china           | beijing          | 27       | 1987-06-17    | baidu        |
| xiaoming | hangzhou    | china           | zhejiang         | 29       | 1987-06-17    | alibaba      |

### multiVersionFixedColumn mode

The HBase table is read as a vertical table. Every record read is in exactly four columns, in this order: `rowKey`, `family:qualifier`, `timestamp`, `value`.

When reading, you need to specify the columns to read explicitly; the value in each cell is taken as one record, and a cell with several versions produces several records. For example:

```bash
hbase(main):018:0> scan 'users',{VERSIONS=>5}
ROW              COLUMN+CELL
 lisi            column=address:city, timestamp=1457101972764, value=beijing
 lisi            column=address:contry, timestamp=1457102773908, value=china
 lisi            column=address:province, timestamp=1457101972736, value=beijing
 lisi            column=info:age, timestamp=1457101972548, value=27
 lisi            column=info:birthday, timestamp=1457101972604, value=1987-06-17
 lisi            column=info:company, timestamp=1457101972653, value=baidu
 xiaoming        column=address:city, timestamp=1457082196082, value=hangzhou
 xiaoming        column=address:contry, timestamp=1457082195729, value=china
 xiaoming        column=address:province, timestamp=1457082195773, value=zhejiang
 xiaoming        column=info:age, timestamp=1457082218735, value=29
 xiaoming        column=info:age, timestamp=1457082178630, value=24
 xiaoming        column=info:birthday, timestamp=1457082186830, value=1987-06-17
 xiaoming        column=info:company, timestamp=1457082189826, value=alibaba
2 row(s) in 0.0260 seconds
```

The data read (4 columns):

| rowKey   | column:qualifier | timestamp     | value      |
| -------- | ---------------- | ------------- | ---------- |
| lisi     | address:city     | 1457101972764 | beijing    |
| lisi     | address:contry   | 1457102773908 | china      |
| lisi     | address:province | 1457101972736 | beijing    |
| lisi     | info:age         | 1457101972548 | 27         |
| lisi     | info:birthday    | 1457101972604 | 1987-06-17 |
| lisi     | info:company     | 1457101972653 | beijing    |
| xiaoming | address:city     | 1457082196082 | hangzhou   |
| xiaoming | address:contry   | 1457082195729 | china      |
| xiaoming | address:province | 1457082195773 | zhejiang   |
| xiaoming | info:age         | 1457082218735 | 29         |
| xiaoming | info:age         | 1457082178630 | 24         |
| xiaoming | info:birthday    | 1457082186830 | 1987-06-17 |
| xiaoming | info:company     | 1457082189826 | alibaba    |

The following configures a job that extracts data from HBase to the local filesystem, once in normal mode and once in multi-version mode:

::: code-group

<<<@/public/assets/jobs/hbase20xreader_normal.json

<<<@/public/assets/jobs/hbase20xreader_version.json
:::

## Parameters

| Configuration | Required | Data Type   | Default Value | Description                                                                                                           |
| :------------ | :------: | ----------- | ------------- | --------------------------------------------------------------------------------------------------------------------- |
| hbaseConfig   |   Yes    | map         | None          | Configuration needed to connect to the HBase cluster; `hbase.zookeeper.quorum` is required, the rest are optional     |
| mode          |   Yes    | string      | None          | Mode used to read HBase, either `normal` or `multiVersionFixedColumn`                                                 |
| table         |   Yes    | string      | None          | Name of the HBase table to read (case sensitive)                                                                      |
| encoding      |    No    | string      | UTF-8         | Encoding, `UTF-8` or `GBK`, used when a binary `HBase byte[]` is converted to `String`                                |
| column        |   Yes    | `list<map>` | None          | Fields to read, required in both `normal` and `multiVersionFixedColumn` modes, see below for details                  |
| maxVersion    |   Yes    | string      | None          | Number of versions to read in multi-version mode, `-1` means all versions, required in `multiVersionFixedColumn` mode |
| range         |    No    | string      | None          | `rowkey` range to read, see below for details                                                                         |
| scanCacheSize |    No    | int         | 256           | Number of rows read from the server each time                                                                         |
| scanBatchSize |    No    | int         | 100           | Number of columns read from the server each time                                                                      |

### column

The fields to read, required in both `normal` and `multiVersionFixedColumn` modes.

#### normal mode

`name` specifies the HBase column to read; apart from `rowkey` it must be in the form `family:qualifier`. `type` specifies the type of the source data, `format` specifies the format of date types,
`value` specifies that the entry is a constant: the data is not read from HBase, but the corresponding column is generated from the `value`. The configuration format is as follows:

```json
{
  "column": [
    {
      "name": "rowkey",
      "type": "string"
    },
    {
      "value": "test",
      "type": "string"
    }
  ]
}
```

In `normal` mode, for every column the user specifies, `type` is mandatory and exactly one of `name` or `value` must be chosen.

#### multiVersionFixedColumn mode

`name` specifies the HBase column to read; apart from `rowkey` it must be in the form `family:qualifier`. `type` specifies the type of the source data, and `format` specifies the format of date types.
Constant columns are not supported in `multiVersionFixedColumn` mode.
The configuration format is as follows:

```json
{
  "mode": "multiVersionFixedColumn",
  "maxVersion": 3,
  "column": [
    {
      "name": "rowkey",
      "type": "string"
    },
    {
      "name": "info: age",
      "type": "string"
    }
  ]
}
```

### range

Specifies the `rowkey` range to read.

- `startRowkey`: starting `rowkey`
- `endRowkey`: ending `rowkey`
- `isBinaryRowkey`: the way the configured `startRowkey` and `endRowkey` are converted to `byte[]`, the default is false; if true, the `Bytes.toBytesBinary(rowkey)` method is called for the conversion; if false, `Bytes.toBytes(rowkey)` is called

The configuration format is as follows:

```json
{
  "range": {
    "startRowkey": "aaa",
    "endRowkey": "ccc",
    "isBinaryRowkey": false
  }
}
```

## Type Conversion

The supported HBase data types to read are listed below:

| Addax Internal Type | HBase Data Type      |
| ------------------- | -------------------- |
| Long                | int, short ,long     |
| Double              | float, double        |
| String              | string, binarystring |
| Date                | date                 |
| Boolean             | boolean              |

::: caution
Types other than those listed above are not supported.
:::

## Limitations

1. Reading dynamic columns is not supported at present. Considering network traffic (supporting dynamic columns would require reading the data of all HBase columns first and then filtering by rule), both of the currently supported read modes require the user to specify the columns to read explicitly.
2. On the splitting of a synchronization job: the current splitting method splits according to the region distribution of the user's HBase table data. That is, within the `[startrowkey，endrowkey]` range the user fills in, one region is split into one task, and a single region is not split.
3. Adding constant columns is not supported in `multiVersionFixedColumn` mode
