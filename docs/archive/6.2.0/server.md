# Server模块

Server模块用于通过HTTP接口提交和管理数据采集任务。用户可通过POST方式提交JSON或YAML任务配置，服务端异步执行采集任务并返回唯一任务ID，随后可通过任务ID查询任务进度和结果，或在需要时取消任务。

每个任务都在**独立的JVM进程**中执行，启动方式与命令行脚本一致，因此任务之间不会互相干扰，任务崩溃不会影响服务端，也可以随时终止。

## 功能简介

- 提供RESTful接口：提交任务、查询状态、取消任务
- 每个任务独立进程执行，日志写入独立的日志文件
- 支持 JSON 与 YAML 两种任务配置格式
- 提交时即校验任务配置，配置错误立即返回，不会产生注定失败的任务
- 支持最大并发任务数限制（默认30，可配置）与已完成任务保留上限
- 支持任务超时自动取消
- 提供启动/停止脚本，支持后台运行

## HTTP接口说明

### 1. 提交任务

- URL: `/api/submit?k1=v1&k2=v2`
- 方法: POST
- 请求体: 任务配置（JSON 或 YAML）。格式优先取自 `Content-Type`（`application/json`、`application/yaml` 等）；未指定时，正文以 `{` 或 `[` 开头的按 JSON 解析，其余按 YAML 解析
- URL 参数会作为任务 JVM 的 `-D` 系统属性传入，与命令行脚本的 `-p"-Dkey=value"` 等价，例如 `?jobName=example-job`、`?curr_date_short=20260101`
- 请求体上限 8 MiB

```shell
curl 'http://localhost:10601/api/submit?jobName=example-job' \
  -H 'Content-Type: application/json' \
  --data-binary @job/job.json
```

返回示例：

```json
{
  "taskId": "xxxx-xxxx-xxxx"
}
```

当并发数达到上限时返回 429：

```json
{
  "error": "ERROR: Maximum number of concurrent tasks reached."
}
```

当任务配置不合法（无法解析、缺少必要配置、插件未安装等）时返回 400，并在 `error` 中给出原因：

```json
{
  "error": "com.wgzhao.addax.core.exception.AddaxException: The configuration is incorrect. ..."
}
```

### 2. 查询任务状态

- URL: `/api/status?taskId={taskId}`
- 方法: GET
- `status` 取值：`RUNNING`、`SUCCESS`、`FAILED`、`CANCELLED`
- 任务不存在（或已被保留上限淘汰）时返回 404

```json
{
  "taskId": "xxxx-xxxx-xxxx",
  "status": "SUCCESS",
  "result": "Job executed.",
  "error": ""
}
```

任务失败时，`error` 取自该任务自己的日志（最后一条 ERROR 记录），并附带退出码和日志文件名：

```json
{
  "taskId": "xxxx-xxxx-xxxx",
  "status": "FAILED",
  "result": "",
  "error": "... ERROR Engine - AddaxException: Cannot find any file in path: [/tmp/no.txt] ... (exit code 2, see addax-xxxx-xxxx-xxxx.log)"
}
```

### 3. 取消任务

- URL: `/api/cancel?taskId={taskId}`
- 方法: POST
- 服务端向任务进程发送终止信号（SIGTERM），10 秒内未退出则强制结束

返回 200：

```json
{
  "taskId": "xxxx-xxxx-xxxx",
  "status": "CANCELLED"
}
```

任务不存在返回 404，任务已经结束返回 409。

## 启动与停止

推荐使用脚本 `core/src/main/bin/addax-server.sh` 启动和停止服务。

### 启动服务

```bash
./addax-server.sh start
```

### 设置最大并发数（如50）并后台运行

```bash
./addax-server.sh start -p 50 --daemon
```

### 停止服务

```bash
./addax-server.sh stop
```

停止服务时会同时终止所有正在运行的任务进程。

### 启动参数

| 参数                 | 说明                                                          |
| -------------------- | ------------------------------------------------------------- |
| `-p, --parallel <n>` | 最大并发任务数，默认 30，或取环境变量 `ADDAX_SERVER_PARALLEL` |
| `--port <port>`      | 监听端口，默认 10601                                          |
| `--bind <address>`   | 绑定地址，默认监听所有网卡                                    |
| `--max-tasks <n>`    | 保留的已完成任务数，默认 10000，超出后先淘汰最旧的            |
| `--task-timeout <n>` | 单个任务的运行上限（秒），默认不限，超时任务会被取消          |
| `-h, --help`         | 显示帮助                                                      |

并发数优先级：命令行 `-p` 或 `--parallel` 优先，其次环境变量 `ADDAX_SERVER_PARALLEL`，默认 30。

## 日志

- 服务端日志：`log/addax-server.log`（后台运行时控制台内容写入 `addax-server.out`）
- 任务日志：每个任务写入独立文件 `log/addax-<taskId>.log`

## 注意事项

- 任务以启动服务端的用户身份执行，并继承服务端 JVM 的参数；服务端目前没有鉴权，请勿暴露在不可信网络
- 每个任务需要一次 JVM 启动开销（约 1~2 秒），对长任务可忽略
- 任务日志文件不会自动清理，请按需归档或定期清理

---

如需更多帮助，请参考其他文档或联系项目维护者。
