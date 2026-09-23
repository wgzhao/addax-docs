# MongoDB Writer

The MongoDB Writer plugin writes data to [MongoDB](https://mongodb.com).

## Configuration Example

This example writes streamed data to a MongoDB collection

<<<@/public/assets/jobs/mongowriter.json

## Parameters

| Configuration | Required | Type          | Default Value | Description                                                                   |
| :------------ | :------: | ------------- | ------------- | ----------------------------------------------------------------------------- |
| address       |   Yes    | list          | None          | MongoDB data address information                                              |
| username      |    No    | string        | None          | MongoDB username                                                              |
| password      |    No    | string        | None          | MongoDB password                                                              |
| collection    |   Yes    | string        | None          | MongoDB collection name                                                       |
| column        |   Yes    | `list<map>/*` | None          | MongoDB document column names                                                 |
| splitter      |    No    | string        | None          | Separator, see below                                                          |
| writeMode     |    No    | string        | insert        | Whether a record is inserted or upserted, `insert` and `update` are supported |
| batchSize     |    No    | int           | 2048          | Number of records of a batch                                                  |
| preSql        |    No    | object        | None          | Statement run before the write, `drop` and `remove`, see below                |

### column

`column` names the fields of the mongo collection together with their types. A received value that is an array needs the separator it is split on as well, so a `column` entry carries at least a `name` and a `type`, for example

```json
{
  "column": [
    {
      "name": "user_id",
      "type": "string"
    }
  ]
}
```

`type` accepts `string` (the default), `int` (int32), `long` (int64), `double`, `date`, `bool`, `bytes`, `objectid`, `array` and `json`, of which `array` needs a `splitter` as well.

An array column states the separator it is split on, like this:

```json
{
  "column": {
    "name": "taglist",
    "type": "Array",
    "splitter": " "
  }
}
```

`"*"` is accepted as well, for example:

```json
{
  "column": ["*"]
}
```

In that case the plugin reads a record as one whole MongoDB document and stores it in MongoDB as BSON.

### splitter

This parameter is used if and only if the string to handle has to be split on a separator into an array of items; the configured separator splits the string into the items stored in the MongoDB array.

### writeMode

Without the parameter a record is inserted directly. To insert or update a record (that is, update it when it exists, insert it otherwise) set the mode to `update`, which requires the field the record is identified by, for example:

```json
{
  "writeMode": "update(unique_id)"
}
```

That configuration decides from the field `unique_id` whether the record is inserted or updated. More than one field is not supported yet, the update field may be a nested path though, such as `update(user.id)`.

The update field has to be one of the fields configured in `column`; with `["*"]` a record is one whole document, so the update field has to be a field of that document. In update mode every record has to carry a value there: a record without one is collected as a dirty record (governed by `errorLimit`) and is not written. Such a record used to produce the filter `{field: null}`, which overwrote a document it never named.

A `writeMode` that is neither `insert` nor `update(field)` is written as an insert, with a warning in the log.

### preSql

`preSql` sits next to `column` and `writeMode`, in the `parameter` of the writer; the old form inside `connection` is still accepted, and `preSql` wins when both are configured.

`preSql` runs before the write to clean the target collection, and supports two types, `drop` and `remove`:

```json
{
  "preSql": {
    "type": "drop"
  }
}
```

```json
{
  "preSql": {
    "type": "remove",
    "json": {
      "city": "beijing"
    },
    "item": [
      {
        "name": "status",
        "condition": "$ne",
        "value": "active"
      }
    ]
  }
}
```

The filter of a `remove` is made of the `json` and `item` parts, both may be configured and are combined with `$and`:

- `json`: a raw query condition, written as a JSON object or as an extended JSON string, the same forms the `query` parameter of the reader accepts. It is parsed as extended JSON, not as JavaScript, so a date cannot be written as `new Date('2026-09-20')`
- `item`: a list of conditions, each with a `name`, an optional `condition` and a `value`, the configuration above reads `status != "active"`

With neither of them configured (or with an empty `json` object) the plugin fails on purpose, so that a mistake does not empty the whole collection.

### Write Failures

- A batch is written unordered, the server keeps every document it accepts and reports the position of the ones it rejects: those are collected as dirty records (governed by `errorLimit`), no other record of the same batch is affected.
- A whole batch that fails on a lower level, such as a connection error, says nothing about which documents arrived, so the plugin falls back to writing the records one by one, and a record that fails on its own is collected as a dirty record as well.

## Type Conversion

| Addax Internal Type | MongoDB Data Type |
| ------------------- | ----------------- |
| Long                | int32, int64      |
| Double              | double            |
| String              | string, array     |
| Date                | date              |
| Boolean             | boolean           |
| Bytes               | binary            |
