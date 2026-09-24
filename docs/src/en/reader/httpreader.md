# HTTP Reader

HTTP Reader plugin implements the ability to read Restful API data.

## Example

### Sample Interface and Data

The following configuration demonstrates how to get data from a specified API, assuming the accessed interface is:

<http://127.0.0.1:9090/mock/17/LDJSC/ASSET>

The interface accepts GET requests with the following parameters:

| Parameter Name | Example Value |
| -------------- | ------------- |
| CURR_DATE      | 2021-01-17    |
| DEPT           | 9400          |
| USERNAME       | andi          |

The following is a sample of accessed data (actual returned data may vary slightly):

::: details
<<<@/public/assets/sql/http.json
:::

We need to get partial key value data from the `result` results.

### Configuration

The following configuration implements getting data from the interface and printing to terminal

<<<@/public/assets/jobs/httpreader.json
Save the above content as `job/httpreader2stream.json` file.

### Execution

Execute the following command for collection

```bash
bin/addax.sh job/httpreader2stream.json
```

The output of the above command is roughly as follows:

:::details
<<<@/public/assets/output/httpreader.txt

## Parameters

| Configuration | Required | Data Type | Default Value | Description                                                                           |
| ------------- | :------: | :-------: | :-----------: | ------------------------------------------------------------------------------------- |
| url           |   Yes    |  string   |     None      | HTTP address to access                                                                |
| reqParams     |    No    |    map    |     None      | Interface request parameters                                                          |
| resultKey     |    No    |  string   |     None      | Key value to get results, if getting entire return value, no need to fill             |
| method        |    No    |  string   |      get      | Request mode, only supports GET and POST, case insensitive                            |
| column        |   Yes    |   list    |     None      | Keys to get, configure as `"*"` to get every key of the records of a page             |
| username      |    No    |  string   |     None      | Authentication account required for interface request (if any), pairs with `password` |
| password      |    No    |  string   |     None      | Password required for interface request (if any)                                      |
| authConfig    |    No    |    map    |     None      | Auth endpoint config; fetch token first, then inject it into business request headers |
| token         |    No    |  string   |     None      | Token for the business interface, a token from `authConfig` wins when both are set    |
| proxy         |    No    |    map    |     None      | Proxy address, see description below                                                  |
| headers       |    No    |    map    |     None      | Custom request header information, reserved headers like `Host` are rejected          |
| isPage        |    No    |  boolean  |     None      | Whether interface supports pagination                                                 |
| pageParams    |    No    |    map    |     None      | Pagination parameters                                                                 |
| maxPages      |    No    |    int    |       0       | Upper bound of paged requests, `0` means no limit                                     |
| timeout       |    No    |    int    |      60       | Timeout in seconds, applied to the connection and to the whole exchange               |
| encoding      |    No    |  string   |     UTF-8     | Charset of the response body; a charset in the response headers is ignored            |
| sslVerify     |    No    |  boolean  |     false     | Whether to verify the certificate and hostname of https endpoints, off by default     |

### reqParams

reqParams are request parameters. If the request is `GET` method, it will be appended to the `url` in `k=v` format.
If the request is `POST` mode, `reqParams` will be sent as JSON content in the request body.
In particular, in `POST` mode, if your request body is not a `k-v` structure, you can set the `key` to empty string, like:

```json
{
  "reqParams": {
    "": [123, 3456]
  }
}
```

The program will handle this case specially.

Note that:

- Parameter values keep the JSON type they have in the configuration: numbers, booleans and arrays are not
  turned into strings, so `{"NUM": 5, "LIST": [1, 2]}` is sent as `{"NUM":5,"LIST":[1,2]}`, in the configured order.
- `GET` parameter values are percent-encoded and the query string of the `url` is kept. A parameter with the
  same name as one in the `url` replaces the value configured there.
- For `POST` the query string of the `url` is kept as well, while `reqParams` only goes into the request body.

### authConfig

`authConfig` is used for "authenticate first, then read business data" scenarios.
When configured, `httpreader` calls the auth endpoint first, extracts a token from
the auth response, and injects it into business request headers.

Example:

```json
{
  "authConfig": {
    "url": "http://127.0.0.1:9090/auth/login",
    "method": "POST",
    "reqParams": {
      "username": "demo",
      "password": "demo"
    },
    "headers": {
      "X-Auth-Client": "Addax"
    },
    "resultKey": "data.token",
    "tokenHeader": "Authorization",
    "tokenPrefix": "Bearer "
  }
}
```

Field description:

- `url`: Auth endpoint URL (required).
- `method`: Auth request method, supports `GET`/`POST`, default `POST`.
- `reqParams`: Auth request parameters; for `POST` they are sent as JSON body, for `GET` they are appended to URL.
- `headers`: Extra request headers for auth endpoint.
- `resultKey`: Token extraction path. JSONPath style is supported (for example `data.token` or `$.data.token`), default `token`.
- `tokenHeader`: Target header name for token injection in business requests, default `Authorization`.
- `tokenPrefix`: Prefix used when injecting token, default `Bearer `.

### proxy

If the accessed interface needs to go through a proxy, you can configure the `proxy` configuration item, which is a json dictionary containing a required `host` field and an optional `auth` field.

```json
{
  "proxy": {
    "host": "http://127.0.0.1:8080",
    "auth": "user:pass"
  }
}
```

`host` is the proxy address. **Only `http` proxies are supported**: the HTTP client of the JDK cannot open a
tunnel through a SOCKS proxy, so a `socks://` host is rejected at startup. The port is mandatory; without a
scheme the address is treated as `http://`, so `"host": "127.0.0.1:8080"` means `http://127.0.0.1:8080`.

If the proxy requires authentication, you can configure `auth`, which consists of username and password separated
by the **first** colon (`:`), so a password may itself contain a colon. The proxy credentials are only sent to the
proxy (answering its 407 challenge), never to an endpoint that answers with 401.

### column

Besides directly specifying keys, `column` also allows using JSON Xpath style to specify key values to get. Suppose you want to read the following JSON file:

```json
{
  "result": [
    {
      "CURR_DATE": "2019-12-09",
      "DEPT": {
        "ID": "9700"
      },
      "KK": [
        {
          "COL1": 1
        },
        {
          "COL2": 2
        }
      ]
    },
    {
      "CURR_DATE": "2021-11-09",
      "DEPT": {
        "ID": "6500"
      },
      "KK": [
        {
          "COL1": 3
        },
        {
          "COL2": 4
        }
      ]
    }
  ]
}
```

If we want to read `CURR_DATE`, `ID`, `COL1`, `COL2` as four fields, your `column` can be configured like this:

```json
{
  "column": ["CURR_DATE", "DEPT.ID", "KK[0].COL1", "KK[1].COL2"]
}
```

The execution result is as follows:

```bash
...
2021-10-30 14:01:50.273 [ taskGroup-0] INFO  Channel              - Channel set record_speed_limit to -1, No tps activated.

2019-12-09	9700	1	2
2021-11-09	6500	3	4

2021-10-30 14:01:53.283 [       job-0] INFO  AbstractScheduler    - Scheduler accomplished all tasks.
2021-10-30 14:01:53.284 [       job-0] INFO  JobContainer         - Addax Writer.Job [streamwriter] do post work.
2021-10-30 14:01:53.284 [       job-0] INFO  JobContainer         - Addax Reader.Job [httpreader] do post work.
2021-10-30 14:01:53.286 [       job-0] INFO  JobContainer         - PerfTrace not enable!
2021-10-30 14:01:53.289 [       job-0] INFO  JobContainer         -
Task start time                    : 2021-10-30 14:01:50
Task end time                      : 2021-10-30 14:01:53
Task total duration                :                  3s
Task average throughput            :               10B/s
Record write speed                 :              0rec/s
Total records read                 :                   2
Total read/write failures          :                   0
```

Note:

- If you specify a non-existent key, it returns NULL value directly.
- With `"*"` the columns are the **union of the keys of every record of the page**; a record that misses a key
  is written as NULL. When the records of a page do not share the same keys a WARN names the keys the first
  record does not have.
- With `"*"` the keys are read **literally**, so a key containing `.` or `[` is not treated as a path. Explicitly
  listed keys are read as JSONPath expressions, which is what makes `DEPT.ID` or `KK[0].COL1` work.
- Every element of the response array has to be a JSON object; a scalar element fails the job instead of
  writing NULL values.

### isPage

The `isPage` parameter is used to specify whether the interface supports pagination. It is a boolean value. If `true`, it means the interface supports pagination, otherwise it doesn't.

When the interface supports pagination, it will automatically paginate reading until the number of records returned by the interface's last return is less than the number of records per page.

If an endpoint answers with a full page every time (for example because it ignores the paging parameters), the
"fewer records than a full page" rule never ends the loop. `maxPages` sets an upper bound of the number of
requests, and when two consecutive pages carry **exactly the same full payload** the reader logs a WARN and stops,
instead of requesting forever and writing the same records again and again.

### pageParams

The `pageParams` parameter only takes effect when the `isPage` parameter is `true`. It is a JSON dictionary containing two optional fields `pageIndex` and `pageSize`.

`pageIndex` is used to indicate the current page for pagination. It is a JSON field containing two optional fields `key` and `value`, where `key` specifies the parameter name for page number, and `value` specifies the current page number value.

`pageSize` is used to indicate the page size for pagination. It is a JSON field containing two optional fields `key` and `value`, where `key` specifies the parameter name for page size, and `value` specifies the page size value.

The default values for these two parameters are:

```json
{
  "pageParams": {
    "pageIndex": {
      "key": "pageIndex",
      "value": 1
    },
    "pageSize": {
      "key": "pageSize",
      "value": 20
    }
  }
}
```

If your interface pagination parameters are not `pageIndex` and `pageSize`, you can specify them through the `pageParams` parameter. For example:

```json
{
  "isPage": true,
  "pageParams": {
    "pageIndex": {
      "key": "page",
      "value": 1
    },
    "pageSize": {
      "key": "size",
      "value": 100
    }
  }
}
```

This means the pagination parameters passed to the interface are `page=1&size=100`.

### Response handling

- Only a `2xx` status code is a success. A `3xx` is not followed as a redirect, it fails the job and the error
  message names the `Location` header.
- An empty response body, a `resultKey` that does not exist or that points to something other than an object or
  an array fail the job with a clear message instead of "succeeded with 0 records".
- `headers` cannot hold `Host`, `Connection`, `Content-Length`, `Expect` or `Upgrade`: the client does not allow
  user code to set them and a configuration that contains one is rejected at startup.
- A configured `Content-Type` is kept; `POST` only adds `application/json` when none is configured.

## Limitations

1. The returned result must be JSON type
2. Currently all key values are treated as string type
3. Currently only one auth call is performed at task startup; automatic token refresh is not supported
4. Paging is serial: the next page is requested after the current one has been processed, and the reader does
   not split into several tasks (`split` returns a single task)
5. The charset of the response body comes from `encoding` (UTF-8 by default), a charset in the response
   headers is not used
