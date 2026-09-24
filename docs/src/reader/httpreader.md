# HTTP Reader

HTTP Reader 插件实现了读取 Restful API 数据的能力

## 示例

### 示例接口与数据

以下配置演示了如何从一个指定的 API 中获取数据，假定访问的接口为：

<http://127.0.0.1:9090/mock/17/LDJSC/ASSET>

接口接受 GET 请求，请求的参数有

| 参数名称  | 参数值示例 |
| --------- | ---------- |
| CURR_DATE | 2021-01-17 |
| DEPT      | 9400       |
| USERNAME  | andi       |

以下是访问的数据样例，（实际返回数据略有不同）

::: details
<<<@/public/assets/sql/http.json
:::

我们需要把 `result` 结果中的部分 key 值数据获取

### 配置

以下配置实现从接口获取数据并打印到终端

<<<@/public/assets/jobs/httpreader.json

将上述内容保存为 `job/httpreader2stream.json` 文件。

### 执行

执行以下命令，进行采集

```bash
bin/addax.sh job/httpreader2stream.json
```

上述命令的输出结果大致如下：

<<<@/public/assets/output/httpreader.txt

## 参数说明

| 配置项     | 是否必须 | 数据类型 | 默认值 | 说明                                                                 |
| ---------- | :------: | :------: | :----: | -------------------------------------------------------------------- |
| url        |    是    |  string  |   无   | 要访问的 HTTP 地址                                                   |
| reqParams  |    否    |   map    |   无   | 接口请求参数                                                         |
| resultKey  |    否    |  string  |   无   | 要获取结果的那个 key 值，如果是获取整个返回值，则可以不用填写        |
| method     |    否    |  string  |  get   | 请求模式，仅支持 GET，POST 两种，不区分大小写                        |
| column     |    是    |   list   |   无   | 要获取的 key，配置为 `"*"` 表示获取本页记录的所有 key 值             |
| username   |    否    |  string  |   无   | 接口请求需要的认证帐号(如有)，与 `password` 必须成对配置             |
| password   |    否    |  string  |   无   | 接口请求需要的密码(如有)                                             |
| authConfig |    否    |   map    |   无   | 鉴权接口配置，先调用鉴权接口拿 token，再用于业务接口请求头           |
| token      |    否    |  string  |   无   | 直接指定业务接口的 token，配置了 `authConfig` 时以鉴权接口返回的为准 |
| proxy      |    否    |   map    |   无   | 代理地址,详见下面描述                                                |
| headers    |    否    |   map    |   无   | 定制的请求头信息，不能包含 `Host`、`Connection` 等客户端保留头       |
| isPage     |    否    | boolean  |   无   | 接口是否分支分页                                                     |
| pageParams |    否    |   map    |   无   | 分页参数                                                             |
| maxPages   |    否    |   int    |   0    | 分页请求数的上限，`0` 表示不限制                                     |
| timeout    |    否    |   int    |   60   | 超时秒数，同时约束连接建立和整次请求（含响应体传输）                 |
| encoding   |    否    |  string  | UTF-8  | 读取响应体使用的字符集；响应头里的 charset 不生效                    |
| sslVerify  |    否    | boolean  | false  | 是否校验 https 端点的证书与主机名，默认关闭（不校验）                |

### reqParams

reqParams 是请求参数， 如果请求是 `GET` 方式，则会以 `k=v` 的方式拼接在 `url` 的后面。
如果请求的是 `POST` 模式，则会把 `reqParams` 当做 JSON 内容作为请求体发送。
特别的，如果在 `POST` 模式下，如果你发送的请求提并不是一个 `k-v` 结构，则可以把 `key` 设置为空字符串，类似如下：

```json
{
  "reqParams": {
    "": [123, 3456]
  }
}
```

程序会针对这种进行进行特别处理。

需要注意：

- 参数值保留配置里的 JSON 类型，数字、布尔、数组不会被转成字符串，例如
  `{"NUM": 5, "LIST": [1, 2]}` 发送的请求体就是 `{"NUM":5,"LIST":[1,2]}`，顺序也与配置一致。
- `GET` 的参数值会做百分号编码，`url` 上自带的查询串会保留下来；与 `reqParams` 同名的参数会覆盖 `url` 里的取值。
- `POST` 时 `url` 上自带的查询串同样保留，`reqParams` 只出现在请求体里。

### authConfig

`authConfig` 用于配置“先鉴权，再拉取业务数据”的场景。配置后，`httpreader` 会先请求鉴权接口，
从响应中提取 token，并将其放入业务接口请求头。

示例：

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

字段说明：

- `url`: 鉴权接口地址（必填）。
- `method`: 鉴权请求方法，支持 `GET`/`POST`，默认 `POST`。
- `reqParams`: 鉴权接口请求参数；`POST` 时作为 JSON body，`GET` 时拼接到 URL。
- `headers`: 鉴权接口额外请求头。
- `resultKey`: token 提取路径，支持 JSONPath 风格（如 `data.token` 或 `$.data.token`），默认 `token`。
- `tokenHeader`: token 写入业务请求头的 header 名，默认 `Authorization`。
- `tokenPrefix`: 写入业务请求头时的前缀，默认 `Bearer`。

### proxy

如果访问的接口需要通过代理，则可以配置 `proxy` 配置项，该配置项是一个 json 字典，包含一个必选的 `host`
字段和一个可选的 `auth` 字段。

```json
{
  "proxy": {
    "host": "http://127.0.0.1:8080",
    "auth": "user:pass"
  }
}
```

`host` 是代理地址，**目前仅支持 `http` 代理**（JDK 的 HTTP 客户端无法通过 SOCKS 代理建立隧道，
配置 `socks://` 会直接报错）。`host` 必须包含端口；省略协议时按 `http://` 处理，例如
`"host": "127.0.0.1:8080"` 等同于 `http://127.0.0.1:8080`。

如果代理需要认证，则可以配置 `auth`，它由用户名和密码组成，两者之间用**第一个**冒号(`:`) 隔开，
密码里可以包含冒号。代理凭据只会发给代理（应答 407 挑战），不会因为业务接口返回 401 而被发送出去。

### column

`column` 除了直接指定 key 之外，还允许用 JSON Xpath 风格来指定需要获取的 key 值，假定你要读取的 JSON 文件如下：

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

我们希望把 `CURR_DATE`, `ID`, `COL1`, `COL2` 当作四个字段读取，那么你的 `column` 可以这样配置：

```json
{
  "column": ["CURR_DATE", "DEPT.ID", "KK[0].COL1", "KK[1].COL2"]
}
```

其执行结果如下：

```bash
...
2021-10-30 14:01:50.273 [ taskGroup-0] INFO  Channel              - Channel set record_speed_limit to -1, No tps activated.

2019-12-09 9700 1 2
2021-11-09 6500 3 4

2021-10-30 14:01:53.283 [       job-0] INFO  AbstractScheduler    - Scheduler accomplished all tasks.
2021-10-30 14:01:53.284 [       job-0] INFO  JobContainer         - Addax Writer.Job [streamwriter] do post work.
2021-10-30 14:01:53.284 [       job-0] INFO  JobContainer         - Addax Reader.Job [httpreader] do post work.
2021-10-30 14:01:53.286 [       job-0] INFO  JobContainer         - PerfTrace not enable!
2021-10-30 14:01:53.289 [       job-0] INFO  JobContainer         -
任务启动时刻                    : 2021-10-30 14:01:50
任务结束时刻                    : 2021-10-30 14:01:53
任务总计耗时                    :                  3s
任务平均流量                    :               10B/s
记录写入速度                    :              0rec/s
读出记录总数                    :                   2
读写失败总数                    :                   0
```

注意：

- 如果你指定了不存在的 Key，则直接返回为 NULL 值。
- 配置为 `"*"` 时，取的是**本页所有记录 key 的并集**，某条记录缺少某个 key 时该列写 NULL；
  当本页记录结构不一致时会在日志里给出 WARN，并列出首条记录没有的 key。
- 配置为 `"*"` 时按**字面 key** 取值，因此 key 里含 `.` 或 `[` 不会被当成路径；而显式列出的 key
  按 JSONPath 解释（`DEPT.ID`、`KK[0].COL1` 这类写法依赖于此）。
- 响应数组里的元素必须是 JSON 对象，元素是标量时会直接报错，而不是写一堆 NULL。

### isPage

`isPage` 参数用来指定接口是否分页，它是一个布尔值，如果为 `true` 则表示接口分页，否则表示不分页。

当接口支持分页时，该直接会自动分页读取，直到接口返回的最后一次返回的数据的记录数小于每页的记录数为止。

如果接口每页都返回满页（例如接口忽略了分页参数），那么仅靠"记录数小于每页大小"无法结束循环。
此时 `maxPages` 可以用来设置请求页数上限；另外当连续两次拿到**完全相同且满页**的响应时，
程序会给出 WARN 并停止分页，以免无限请求并反复写入重复数据。

### pageParams

`pageParams` 参数仅在 `isPage` 参数为 `true` 时生效，它是一个 JSON 字典，包含两个可选字段 `pageIndex` 和 `pageSize` 。

`pageIndex` 用来表示用于分页指示的当前页面，他是一个 JSON 字段，包含两个可选字段 `key` 和 `value` ，其中 `key` 用来指定表示页码的参数名，`value` 用来指定当前页码的值。

`pageSize` 用来表示用于分页指示的每页大小，他是一个 JSON 字段，包含两个可选字段 `key` 和 `value` ，其中 `key` 用来指定表示每页大小的参数名，`value` 用来指定每页大小的值。

这两个参数的默认值如下：

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

如果你的接口分页参数不是 `pageIndex` 和 `pageSize` ，则可以通过 `pageParams` 参数来指定。比如

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

这表示你传递给接口的分页参数为 `page=1&size=100` 。

### 响应处理

- 只有 `2xx` 状态码会被当作成功；`3xx` 不会自动跟随重定向，会直接报错并在消息里给出 `Location`。
- 响应体为空、`resultKey` 指定的 key 不存在、或它指向的不是对象/数组时，任务会失败并给出明确信息，
  不会再出现"成功但读出 0 条记录"的情况。
- `headers` 里不能配置 `Host`、`Connection`、`Content-Length`、`Expect`、`Upgrade` 这几个头，
  客户端不允许用户代码设置它们，配置了会在启动时报错。
- 配置了 `Content-Type` 时以你的配置为准，没有配置时 `POST` 会补一个 `application/json`。

## 限制说明

1. 返回的结果必须是 JSON 类型
2. 当前所有 key 的值均当作字符串类型
3. 当前仅支持“任务启动时鉴权一次”，不支持运行中自动刷新 token
4. 分页是串行的：上一页处理完才请求下一页；读取任务也不做拆分（`split` 只返回一个 task）
5. 响应体字符集由 `encoding` 决定（默认 UTF-8），不读取响应头里的 charset
