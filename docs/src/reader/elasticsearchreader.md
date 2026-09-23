# ElasticSearchReader

ElasticSearchReader 插件实现了从 [Elasticsearch](https://www.elastic.co/cn/elasticsearch/) 读取索引的功能， 它通过 Elasticsearch 提供的 Rest API （默认端口9200），执行指定的查询语句批量获取数据

## 示例

假定要获取的索引内容如下

<<<@/public/assets/sql/es.json
配置一个从 Elasticsearch 读取数据并打印到终端的任务

<<<@/public/assets/jobs/esreader.json

将上述内容保存为 `job/es2stream.json`

执行下面的命令进行采集

```bash
bin/addax.sh job/es2stream.json
```

其输出结果类似如下（输出记录数有删减)

<<<@/public/assets/output/esreader.txt

## 参数说明

| 配置项      | 是否必须 | 类型    | 默认值                 | 描述                                               |
| :---------- | :------: | ------- | ---------------------- | -------------------------------------------------- |
| endpoint    |    是    | string  | 无                     | ElasticSearch的连接地址                            |
| accessId    |    否    | string  | `""`                   | http auth中的user                                  |
| accessKey   |    否    | string  | `""`                   | http auth中的password                              |
| index       |    是    | string  | 无                     | elasticsearch中的index名                           |
| search      |    是    | list    | `[]`                   | json格式api搜索数据体                              |
| column      |    是    | list    | 无                     | 需要读取的字段                                     |
| timeout     |    否    | int     | 60                     | 客户端超时时间(单位：秒)                           |
| discovery   |    否    | boolean | false                  | 启用节点发现(轮询)并定期更新客户机中的服务器列表   |
| compression |    否    | boolean | true                   | http请求，开启压缩                                 |
| multiThread |    否    | boolean | true                   | http请求，是否有多线程                             |
| searchType  |    否    | string  | `dfs_query_then_fetch` | 搜索类型                                           |
| headers     |    否    | map     | `{}`                   | http请求头                                         |
| scroll      |    否    | string  | `""`                   | 滚动分页配置                                       |
| batchSize   |    否    | int     | 1000                   | 滚动分页每页条数, 当 `search` 未设置 `size` 时生效 |
| filter      |    否    | string  | `""`                   | 用 OGNL 表达式筛选要读取的文档                     |

### scroll 与分页大小

当搜索体中没有 `size` 时，Elasticsearch 每页只返回 10 条文档。配合 `scroll` 使用
时，这意味着每 10 条文档就要一次往返请求，因此当搜索体未设置 `size` 时，滚动分页
使用 `batchSize`(默认 1000) 作为每页条数；搜索体中显式设置的 `size` 始终优先。
未配置 `scroll` 时不会改动搜索体——一次请求读取索引前若干条是正常用法——此时若搜
索体也没有 `size`，任务日志会提示只会读取 10 条文档。

### filter

`filter` 是一个针对每条文档求值的
[OGNL](https://commons.apache.org/proper/commons-ognl/language-guide.html)
表达式，只有表达式接受的文档才会写出。例如 `qty > 0 and active == true` 会保留
`qty` 为正且处于激活状态的文档；`qty` 缺失的文档求值结果为 null，会被丢弃。

表达式针对读取到的字段求值，因此只能引用 `column` 中列出的字段。表达式的结果必须
是布尔值；对于无法求值的文档，该文档会被保留。

### search

search 配置项允许配置为满足 Elasticsearch API 查询要求的内容，比如这样：

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

searchType 目前支持以下几种：

- dfs_query_then_fetch
- query_then_fetch
- count
- scan
