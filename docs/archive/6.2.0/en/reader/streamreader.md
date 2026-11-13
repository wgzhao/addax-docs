# Stream Reader

Stream Reader is a plugin that reads data from memory, mainly used to quickly generate expected data and test write plugins.

A complete StreamReader configuration file is as follows:

<<<@/public/assets/jobs/streamreader.json
The above configuration file will generate 10 records (assuming channel is 1), with each record containing:

`unique_id,'1989-06-04 08:12:13',1984,1989.64,true,'a long text'`

Currently StreamReader supports all output data types listed above:

- `string` String type
- `date` Date type
- `long` All integer types
- `double` All floating point numbers
- `bool` Boolean type
- `bytes` Byte type

The `date` type also supports `dateFormat` configuration to specify the format of input dates, default is `yyyy-MM-dd HH:mm:ss`. For example, your input can be like this:

```json
{
  "value": "1989/06/04 12:13:14",
  "type": "date",
  "dateFormat": "yyyy/MM/dd HH:mm:ss"
}
```

Note that regardless of the input format for date type, it is internally converted to `yyyy-MM-dd HH:mm:ss` format.

Use `HH` (the hour of a 24 hour clock) for the hour in a date format. `hh` is the hour of a 12 hour clock and needs an `AM/PM` marker to be read, so a format with `hh` but without the marker fails the job at startup with a message that asks for `HH`.

StreamReader also supports random input functionality. For example, to randomly get any integer between 0-10, we can configure the column like this:

```json
{
  "random": "0,10",
  "type": "long"
}
```

To get a random floating point number between 0 and 100, configure like this:

```json
{
  "random": "0,100",
  "type": "double"
}
```

To specify decimal places for floating point numbers, e.g., 2 decimal places, configure like this:

```json
{
  "random": "0,100,2",
  "type": "double"
}
```

Note: It cannot guarantee that the generated decimal always has exactly 2 places. If the decimal part is 0, the decimal places will be fewer than specified.

Here we use the `random` keyword to indicate its value is random, with the range being a closed interval.

Other random type configurations are as follows:

- `long`: random 0, 10 - random number between 0 and 10
- `string`: random 0, 10 - random string of length between 0 and 10
- `bool`: random 0, 10 - ratio of false and true occurrences
- `double`: random 0, 10 - random floating point between 0 and 10
- `double`: random 0, 10, 2 - random floating point between 0 and 10 with 2 decimal places
- `date`: random '2014-07-07 00:00:00', '2016-07-07 00:00:00' - random time between start time and end time, default date format (commas not supported) yyyy-MM-dd HH:mm:ss
- `BYTES`: random 0, 10 - random string of length between 0 and 10, get its UTF-8 encoded binary string

StreamReader also supports increment functions. For example, to get an arithmetic sequence starting from 1 with increment of 5, configure like this:

```json
{
  "incr": "1,5",
  "type": "long"
}
```

To get a decreasing sequence, change the step size (5 in the above example) to negative. Default step size is 1.

Increment also supports date type (introduced in version `4.0.1`), for example:

```json
{
  "incr": "1989-06-04 09:01:02,2,d",
  "type": "date"
}
```

`incr` consists of three parts: start date, step size, and step unit, separated by English commas (,).


- Start date: Correct date string, default format is `yyyy-MM-dd HH:mm:ss`. If time format is different, need to configure `dateFormat` to specify date format. This is mandatory.
- Step size: Length to increase each time, default is 1. For decreasing, fill in negative number. This is optional.
- Step unit: What time unit to increment/decrement by, default is by day. This is optional. Available units:
  - d/day
  - M/month
  - y/year
  - h/hour
  - m/minute
  - s/second
  - w/week

Configuration item `sliceRecordCount` specifies the number of data records to generate. If `channel` is specified, actual generated records = `sliceRecordCount * channel`

## Built-in data rules

Besides generating constants, random values and increment sequences by type, StreamReader can
generate data that looks like the data of a real system - an ID card number, a bank card number, an
address, a company name. Such a column names its rule with the `rule` item, needs no `value`:

```json
{
  "rule": "idCard"
}
```

A complete job that uses every rule:

<<<@/public/assets/jobs/streamreader-rules.json

The output of that job looks like this:

<<<@/public/assets/output/streamreader-rules.txt

The built-in rules are:

| Rule           | Description                                    | Example                                | Type   | Note                                                                 |
| -------------- | ---------------------------------------------- | -------------------------------------- | ------ | -------------------------------------------------------------------- |
| `address`      | A domestic address                             | `辽宁省兰州市徐汇区东山街176号`        | string |                                                                      |
| `bank`         | A domestic bank name                           | `华夏银行`                             | string |                                                                      |
| `company`      | A domestic company name                        | `万迅电脑科技有限公司`                 | string |                                                                      |
| `creditCard`   | A credit card number                           | `6227544006180760`                     | string | 16 digits                                                            |
| `debitCard`    | A debit card number                            | `6216695638260308313`                  | string | 19 digits                                                            |
| `email`        | An email address                               | `ok2a@gmail.com`                       | string |                                                                      |
| `idCard`       | A domestic ID card number                      | `350600198508222018`                   | string | 18 digits with a valid checksum and area code                        |
| `job`          | A job title                                    | `系统工程师`                           | string |                                                                      |
| `lat`          | A latitude                                     | `48.6648764`                           | double | 7 decimal places, also known as `latitude`                           |
| `lng`          | A longitude                                    | `120.6018163`                          | double | 7 decimal places, also known as `longitude`                          |
| `name`         | A domestic name                                | `池浩`                                 | string |                                                                      |
| `phone`        | A domestic mobile phone number                 | `15292600492`                          | string |                                                                      |
| `stockAccount` | A 10 digits stock trading account              | `0692522928`                           | string |                                                                      |
| `stockCode`    | A 6 digits stock symbol                        | `687461`                               | string |                                                                      |
| `uuid`         | A random UUID                                  | `bc1cf125-929b-43b7-b324-d7c4cc5a75d2` | string |                                                                      |
| `zipCode`      | A 6 digits postal code                         | `411105`                               | long   |                                                                      |

The name of a rule ignores case, underscores and dashes, so `idCard`, `id_card` and `ID_CARD` are
the same rule.

Two notes about the rules:

- the type of a rule is fixed and can not be changed with the `type` item; a `type` that does not
  match the type of the rule fails the job at startup
- a rule builds its value itself, so a configured `value` is ignored with a warning

## The rule item

Besides the built-in rules above, `rule` also accepts the generic rules `constant`, `random` and
`incr`. Their parameter is written in the `value` item and means exactly the same as the items
described earlier in this page:

```json
{ "rule": "constant", "value": "addax", "type": "string" }
{ "rule": "random", "value": "1,10", "type": "long" }
{ "rule": "incr", "value": "1,5", "type": "long" }
{ "rule": "incr", "value": "1989-06-04 09:01:02,2,d", "type": "date" }
```

In other words, `{"random": "1,10"}` is the same as `{"rule": "random", "value": "1,10"}` and
`{"incr": "1,5"}` is the same as `{"rule": "incr", "value": "1,5"}`. Both forms are supported; when
a column configures `rule` and `random`/`incr` at the same time, the rule wins and the ignored item
is reported with a warning.

## Migrating from datareader

The `datareader` plugin has been merged into StreamReader: its built-in rules (ID card, bank card,
address, ...) are provided by StreamReader now, and the `datareader` plugin is no longer released
separately.

To migrate a job, change the name of the plugin - the columns need no change:

```json
{
  "reader": {
    "name": "streamreader",
    "parameter": {
      "column": [
        { "rule": "idCard" }
      ],
      "sliceRecordCount": 10
    }
  }
}
```

A date format that uses the 12 hour field `hh` has to be changed to `HH` as well.
