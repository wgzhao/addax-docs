# ElasticSearch Writer

ElasticSearch Writer plugin is used to write data to [ElasticSearch](https://www.elastic.co/cn/elastic-stack/).
It is implemented through elasticsearch's rest api interface, writing data to elasticsearch in batches.

## Requirements

Elasticsearch 7.0 or later. Elasticsearch removed the mapping type in 7.0: the index is
created with its settings and mappings in one request, and the mappings of an index that
already exists are put at `/{index}/_mapping`. There is no `type` parameter any more.

## Configuration Example

<<<@/public/assets/jobs/eswriter.json

## Parameters

| Configuration    | Required | Data Type   | Default Value | Description                                                                                              |
| :--------------- | :------: | ----------- | ------------- | -------------------------------------------------------------------------------------------------------- |
| endpoint         |   Yes    | string      | None          | ElasticSearch connection address, if cluster, multiple addresses separated by comma (,)                  |
| accessId         |    No    | string      | Empty         | User in http auth, default is empty                                                                      |
| accessKey        |    No    | string      | Empty         | Password in http auth                                                                                    |
| index            |   Yes    | string      | None          | Index name                                                                                               |
| cleanup          |    No    | boolean     | false         | Whether to delete original table                                                                         |
| batchSize        |    No    | int         | 1000          | Number of records in each batch                                                                          |
| trySize          |    No    | int         | 30            | Number of retries after failure                                                                          |
| timeout          |    No    | int         | 600000        | Client timeout in milliseconds (ms)                                                                      |
| discovery        |    No    | boolean     | false         | Enable node discovery (polling) and periodically update server list in client                            |
| compression      |    No    | boolean     | true          | Whether to enable http request compression                                                               |
| multiThread      |    No    | boolean     | true          | Whether to enable multi-threaded http requests                                                           |
| ignoreWriteError |    No    | boolean     | false         | A batch that failed after every retry is skipped with a warning when `true`, and fails the job otherwise |
| ignoreParseError |    No    | boolean     | true          | Whether to continue writing when data format parsing error occurs                                        |
| alias            |    No    | string      | None          | Alias to write after data import is completed                                                            |
| aliasMode        |    No    | string      | append        | Mode for adding alias after data import completion, append (add mode), exclusive (keep only this one)    |
| settings         |    No    | map         | None          | Settings when creating index, same as elasticsearch official                                             |
| splitter         |    No    | string      | `,`           | If inserted data is array, use specified delimiter                                                       |
| column           |   Yes    | `list<map>` | None          | Fields of the document, see below                                                                        |
| dynamic          |    No    | boolean     | false         | Don't use addax mappings, use es's own automatic mappings                                                |

### column

One entry per field of the document, matched to the columns of the reader by position: the
two lists must have the same number of entries.

| Key                             | Meaning                                                                                                                                                                                |
| :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name                            | The field name. A field named `pk` is the document id instead of a field (see the constraints below)                                                                                   |
| type                            | The field type: `keyword`, `text`, `long`, `integer`, `short`, `byte`, `double`, `float`, `date`, `boolean`, `binary`, `ip`, `object`, `nested`, `flattened`, `geo_point`, `geo_shape` |
| array                           | `true` when the column holds the elements of an array in one string, split by `splitter`                                                                                               |
| format, timezone                | A `date`: how the incoming text is read, and in which zone to interpret it. The value is written to elasticsearch as ISO-8601                                                          |
| analyzer, norms, index_options  | A `text`: elasticsearch's own parameters, `index_options` being `docs`, `freqs`, `positions` or `offsets`                                                                              |
| doc_values, index, ignore_above | As elasticsearch defines them                                                                                                                                                          |
| eager_global_ordinals           | A `keyword`                                                                                                                                                                            |

`tree` and `precision` of a `geo_shape` were part of the quadtree implementation that
elasticsearch 6 replaced with a BKD tree: they are ignored, with a warning.

### batchSize

The number of documents in one bulk request. It is the knob with the most effect on how
long a job takes: 200 000 documents of 250 bytes written to a single node took 12 seconds
with the default of 1000 and 6 seconds with 5000 (both at one channel), because a bulk
request costs a round trip whatever its size. Elasticsearch recommends keeping a bulk
between 5 and 15 MB, so a wider document wants a smaller batch.

## Constraints

- If importing id, data import failures will also retry, re-import will only overwrite, ensuring data consistency
- If not importing id, it's append_only mode, elasticsearch automatically generates id, speed will improve about 20%, but data cannot be repaired, suitable for log-type data (low precision requirements)
- A record whose `pk` value is empty is written without an id: elasticsearch generates one, and the job logs a warning. It used to be written as the document id `null`, which put every such record on that one id
- The alias is set after the documents are written, and a job fails when it cannot be set: it used to be logged and the job reported success, leaving a reader of the alias on the previous index
