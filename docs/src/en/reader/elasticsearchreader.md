# ElasticSearchReader

ElasticSearchReader plugin implements the functionality of reading indexes from [Elasticsearch](https://www.elastic.co/cn/elasticsearch/). It uses the Rest API provided by Elasticsearch (default port 9200) to execute specified query statements and batch retrieve data.

## Example

Assume the index content to be retrieved is as follows

<<<@/public/assets/sql/es.json
Configure a task to read data from Elasticsearch and print to terminal

<<<@/public/assets/jobs/esreader.json

Save the above content as `job/es2stream.json`

Execute the following command for collection

```bash
bin/addax.sh job/es2stream.json
```

The output result is similar to the following (output records are reduced):

<<<@/public/assets/output/esreader.txt

## Parameters

| Configuration | Required | Type    | Default Value          | Description                                                                   |
| :------------ | :------: | ------- | ---------------------- | ----------------------------------------------------------------------------- |
| endpoint      |   Yes    | string  | None                   | ElasticSearch connection address                                              |
| accessId      |    No    | string  | `""`                   | User in http auth                                                             |
| accessKey     |    No    | string  | `""`                   | Password in http auth                                                         |
| index         |   Yes    | string  | None                   | Index name in elasticsearch                                                   |
| search        |   Yes    | list    | `[]`                   | JSON format API search data body                                              |
| column        |   Yes    | list    | None                   | Fields to be read                                                             |
| timeout       |    No    | int     | 60                     | Client timeout (unit: seconds)                                                |
| discovery     |    No    | boolean | false                  | Enable node discovery (polling) and periodically update server list in client |
| compression   |    No    | boolean | true                   | HTTP request, enable compression                                              |
| multiThread   |    No    | boolean | true                   | HTTP request, whether multi-threaded                                          |
| searchType    |    No    | string  | `dfs_query_then_fetch` | Search type                                                                   |
| headers       |    No    | map     | `{}`                   | HTTP request headers                                                          |
| scroll        |    No    | string  | `""`                   | Scroll pagination configuration                                               |
| batchSize     |    No    | int     | 1000                   | Documents per scroll page, used when `search` does not set `size`             |
| filter        |    No    | string  | `""`                   | OGNL expression selecting the documents to read                               |

### scroll and the page size

Elasticsearch answers with 10 documents per page when the search body carries no
`size`. Together with `scroll` that is one round trip per 10 documents, so a scroll
without a `size` in the body pages with `batchSize` (1000 by default) instead. A `size`
in the body always wins. Without `scroll` the body is left untouched -- reading the
first documents of an index in one request is a legitimate use -- and the job logs a
warning when it is about to read only 10 of them.

### filter

`filter` is an [OGNL](https://commons.apache.org/proper/commons-ognl/language-guide.html)
expression evaluated against every document, and only the documents it accepts are
written. `qty > 0 and active == true` keeps the documents that have a positive `qty` and
are active; a document whose `qty` is missing evaluates to null and is dropped.

The expression is evaluated against the fields the reader has read, so it can only use
the columns listed in `column`. It must evaluate to a boolean, and a document for which
it cannot be evaluated is kept.

### search

The search configuration item allows configuration of content that meets Elasticsearch API query requirements, like this:

```json
{
  "query": {
    "match": {
      "message": "myProduct"
    }
  },
  "aggregations": {
    "top_10_states": {
      "terms": {
        "field": "state",
        "size": 10
      }
    }
  }
}
```

### searchType

searchType currently supports the following types:

- dfs_query_then_fetch
- query_then_fetch
- count
- scan
