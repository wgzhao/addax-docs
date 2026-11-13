# Postgresql Writer

Postgresql Writer plugin implements the functionality of writing data to [PostgreSQL](https://postgresql.org) database tables.

## Example

The following configuration demonstrates reading data from a specified PostgreSQL table and inserting it into another table with the same table structure, to test the data types supported by this plugin.

### Table Structure Information

Assume the table creation statement and input insertion statement are as follows:

<<<@/public/assets/sql/postgresql.sql

The statement to create the table to be inserted is as follows:

create table addax_tbl1 as select \* from addax_tbl where 1=2;

### Task Configuration

The following is the configuration file

<<<@/public/assets/jobs/pgwriter.json
Save the above configuration file as `job/pg2pg.json`

### Execute Collection Command

Execute the following command for data collection

```bash
bin/addax.sh job/pg2pg.json
```

## Parameters

This plugin is based on [RDBMS Writer](rdbmswriter), so you can refer to all configuration items of RDBMS Writer.

### writeMode

By default, `insert into` syntax is used to write to PostgreSQL tables. If you want to use the mode of updating when primary key exists and inserting when it doesn't exist, you can use `update` mode. Assuming the table's primary key is `id`, the `writeMode` configuration method is as follows:

```json
"writeMode": "update(id)"
```

If it's a composite unique index, the configuration method is as follows:

```json
"writeMode": "update(col1, col2)"
```

Note: `update` mode was first added in version `3.1.6`, previous versions do not support it.

## Type Conversion

Currently PostgresqlWriter supports most PostgreSQL types, but there are also some cases that are not supported. Please check your types carefully.

The following lists PostgresqlWriter's type conversion list for PostgreSQL:

| Addax Internal Type | PostgreSQL Data Type                                 |
| ------------------- | ---------------------------------------------------- |
| Long                | bigint, bigserial, integer, smallint, serial         |
| Double              | double precision, money, numeric, real               |
| String              | varchar, char, text, inet,cidr,macaddr,uuid,xml,json |
| Date                | date, time, timestamp                                |
| Boolean             | bool, bit(1)                                         |
| Bytes               | bytea, bit(n)                                        |

## Writing a bit Column

A `bit(n)` column (n > 1) accepts the following forms, and the value is stored in exactly the width
the target column declares:

| Source Column Type | Meaning                                                                                                                    | Example         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Bytes              | the value packed, 8 bits per byte, most significant byte first, which is the form an RDBMS reader gives for a `bit` column | `0x05` → `101`  |
| String             | a bit string, only the characters `0` and `1` are accepted                                                                 | `"101"` → `101` |
| Long/Double        | the number itself, the bit pattern being its binary form, whole numbers only                                               | `5` → `101`     |
| Boolean            | a single bit, the path a `bit(1)` column takes                                                                             | `true` → `1`    |

- A value narrower than the column is padded with leading zeros; `bit varying` declares no width,
  so the value is written in the width it has.
- These are collected as dirty records (governed by `errorLimit`): a bit string holding any other
  character, a number with a fractional part, and a value that needs more bits than the column has.
- A decimal number delivered as a string is not read as a decimal: `"255"` is not 255 but an invalid
  bit string, so declare the source column as long or double instead.

## Known Limitations

Except for the data types listed above, other data types are theoretically converted to string type, but accuracy is not guaranteed.
