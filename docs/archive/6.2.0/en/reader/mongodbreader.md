# MongoDB Reader

The MongoDBReader plugin reads from MongoDB with the Java client MongoClient.

## Configuration Example

This example reads a collection from MongoDB and prints it to the terminal

<<<@/public/assets/jobs/mongoreader.json

## Parameters

| Configuration | Required | Type          | Default Value | Description                                                 |
| :------------ | :------: | ------------- | ------------- | ----------------------------------------------------------- |
| address       |   Yes    | list          | None          | MongoDB data address information, multiple can be written   |
| username      |    No    | string        | None          | MongoDB username                                            |
| password      |    No    | string        | None          | MongoDB password                                            |
| database      |   Yes    | string        | None          | MongoDB database                                            |
| collection    |   Yes    | string        | None          | MongoDB collection name, a single value or a range wildcard |
| column        |   Yes    | list          | None          | MongoDB document column names, `["*"]` reads every column   |
| query         |    No    | string/object | None          | Custom query conditions, see below                          |
| fetchSize     |    No    | int           | 2048          | Batch size for retrieving records                           |

### collection

`collection` accepts a string only, written in one of two forms:

- A single collection: `collection`
- A range wildcard: `collection[0-9]` (expands to `collection0` through `collection9`)

A mixed form (`collection[0-3],collection9`) is not supported.

With a range wildcard, a collection that does not exist is warned about and skipped, the job is not interrupted.

### column

`column` names the fields to read. The plugin makes two assumptions about how a field name is written:

- It cannot start with a single quote (`'`)
- It cannot consist of digits and dots (`.`) only

Those assumptions let the configuration carry constants as extra fields. A job that collects a collection usually adds the collection time and the collection source as constants, which is written like this:

```json
{
  "column": ["col1", "col2", "col3", "'source_mongodb'", "20211026", "123.12"]
}
```

The last three entries of the configuration above are constants, read as a string, an integer and a floating point number.

A nested field is addressed with a dot (`.`) for each level of the hierarchy, for example:

```json
{
  "column": ["col1", "col2", "col3.subcol1", "col3.subcol2"]
}
```

Naming a field together with a field below it (such as `["col3", "col3.subcol1"]`) is allowed as well, both read a value. The plugin asks the server for the wider path only and takes the narrower field from the data it already has.

### query

`query` filters the documents to read. It is written either as an extended JSON string or directly as a JSON object:

```json
{
  "query": "{amount: {$gt: 140900}, oc_date: {$gt: 20190110}}"
}
```

```json
{
  "query": {
    "amount": {
      "$gt": 140900
    }
  }
}
```

The query above is like `where amount > 140900 and oc_date > 20190110` in SQL.

`query` is parsed as **extended JSON**, not as JavaScript, so a JavaScript form that mongosh accepts does not necessarily work here, dates in particular:

| Form                                     | Result                                                                                                                                          |
| :--------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| `new Date('2026-09-20')`                 | ✗ fails with `JSON reader expected a date in 'EEE MMM dd yyyy HH:mm:ss z' format`, a string is only read as a Java date format, not recommended |
| `new Date(1789833600000)`                | ✓ a millisecond number                                                                                                                          |
| `ISODate('2026-09-20')`                  | ✓ read as midnight of that day in the **default time zone of the JVM running the task**                                                         |
| `ISODate('2026-09-20T00:00:00Z')`        | ✓ read as UTC                                                                                                                                   |
| `ISODate('2026-09-20T00:00:00+08:00')`   | ✗ a time zone offset is not accepted                                                                                                            |
| `{"$date": "2026-09-20T00:00:00+08:00"}` | ✓ the time zone is explicit, recommended                                                                                                        |
| `{"$date": 1789833600000}`               | ✓ a millisecond number, recommended                                                                                                             |

Note that `new Date('2026-09-20')` in mongosh is read as UTC, while `ISODate('2026-09-20')` here is read in the default time zone of the JVM running the task, the two differ by the offset of that time zone. Use `{"$date": ...}` with an explicit offset, or a millisecond number, when the result has to be the same across environments.

A `query` that cannot be parsed ends the job as a configuration error and names the accepted forms, it never silently turns into "no record read".

A `query` that matches no document, or a collection that is empty, ends the job normally after reading 0 records, it is not an error.

## Type Conversion

| Addax Internal Type | MongoDB Data Type                                                  |
| ------------------- | ------------------------------------------------------------------ |
| Long                | int32, int64                                                       |
| Double              | double                                                             |
| String              | string, objectid, decimal128, array, document, timestamp, regex, … |
| Date                | date                                                               |
| Boolean             | boolean                                                            |
| Bytes               | binary                                                             |

- `objectid` reads as its 24 character hex string, `decimal128` as its decimal text, `array` and `document` as extended JSON text.
- A value without an Addax counterpart, such as a timestamp, a regular expression, a minkey or a maxkey, reads as its extended JSON text as well, the same text a `["*"]` column yields.
- A field that is absent, or whose value is `null`, reads as an empty string.
- With `["*"]` the whole document reads as one extended JSON text column, it is not split as the table above describes.
