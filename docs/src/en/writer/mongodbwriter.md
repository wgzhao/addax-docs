# MongoDB Writer

The MongoDB Writer plugin writes data to [MongoDB](https://mongodb.com).

## Configuration Example

This example writes streamed data to a MongoDB collection

<<<@/public/assets/jobs/mongowriter.json

## Parameters

| Configuration | Required | Type          | Default Value | Description                                                                                 |
| :------------ | :------: | ------------- | ------------- | ------------------------------------------------------------------------------------------- |
| address       |   Yes    | list          | None          | MongoDB data address information                                                            |
| username      |    No    | string        | None          | MongoDB username                                                                            |
| password      |    No    | string        | None          | MongoDB password                                                                            |
| collection    |   Yes    | string        | None          | MongoDB collection name                                                                     |
| column        |   Yes    | `list<map>/*` | None          | MongoDB document column names                                                               |
| splitter      |    No    | string        | None          | Separator, see below                                                                        |
| writeMode     |    No    | string        | insert        | Write mode, `insert`, `update(field)` and `merge(field, opColumn)` are supported, see below |
| batchSize     |    No    | int           | 2048          | Number of records of a batch                                                                |
| preSql        |    No    | object        | None          | Statement run before the write, `drop` and `remove`, see below                              |

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

The `merge(field, opColumn)` mode decides from the op column of every record whether the document is written or deleted, both parameters are required:

```json
{
  "writeMode": "merge(unique_id, op)"
}
```

The op column accepts the following values, case-insensitively:

| op column value                   | Behaviour                                              |
| :-------------------------------- | :----------------------------------------------------- |
| `A`, `I`, `U`, `INSERT`, `UPDATE` | Upsert by the field: replace the document or insert it |
| `D`, `DELETE`                     | Delete the documents matched by the field              |

- The op column is a control field, it is removed from the document before the write and never stored in MongoDB.
- A record whose op column is `null`, an empty string or any other value is collected as a dirty record (governed by `errorLimit`) and is not written; it never falls back to an insert.
- A record without a value at the merge key is collected as a dirty record as well. The delete filters on that field, so it should identify the target document unambiguously.
- When the same key value appears more than once in one batch, only its last operation takes effect, so the final state does not depend on the order of the records in the batch.
- Both the merge key and the op column have to be fields configured in `column` (the key may be the parent path of configured leaf fields), otherwise the task fails while it initializes; with `["*"]` the record itself carries them.

`merge` suits a sync that carries deletion marks: the source writes the operation type into the op column and the writer decides whether to replace or delete the target document from it.

Nested keys work with per-leaf columns (`meta.id`, `meta.tag`) or with `["*"]`; a column of type `json` stores the whole object as one value, so its inner fields cannot be used as the key or the op column.

Without the parameter a record is inserted. The configured value accepts `insert`, `update(field)` and `merge(field, opColumn)`: the mode name is case-insensitive, but the whole value has to be the mode. Any other value, such as a typo, an empty value or trailing text like `update(id)junk`, fails the task with `ILLEGAL_VALUE` instead of falling back to an insert.

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
