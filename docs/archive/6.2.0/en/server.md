# Server Module

The Server module provides HTTP interfaces for submitting and managing data collection tasks. Users can submit a JSON or YAML job configuration via POST, and the server executes the job asynchronously, returning a unique task ID. Progress and results can be queried with that ID, and a running job can be cancelled.

Every job runs in a **JVM of its own**, started the way the command line script starts one, so jobs cannot interfere with each other, a crashing job cannot take the server down, and a job can be stopped at any time.

## Features

- RESTful API for task submission, status query and cancellation
- Every job runs in its own process and logs into a log file of its own
- JSON and YAML job configurations
- The job configuration is validated at submission time, a broken job is answered right away instead of becoming a doomed task
- Configurable maximum concurrent tasks (default: 30) and a bound on finished tasks kept
- Optional task timeout
- Startup/shutdown script with background mode support

## HTTP API

### 1. Submit Task

- URL: `/api/submit?k1=v1&k2=v2`
- Method: POST
- Body: the job configuration (JSON or YAML). The format comes from the `Content-Type` header (`application/json`, `application/yaml`, ...); without it, a body starting with `{` or `[` is read as JSON and anything else as YAML
- URL parameters become `-D` system properties of the job JVM, the equivalent of `-p"-Dkey=value"` on the command line script, for example `?jobName=example-job` or `?curr_date_short=20260101`
- Request bodies are limited to 8 MiB

```shell
curl 'http://localhost:10601/api/submit?jobName=example-job' \
  -H 'Content-Type: application/json' \
  --data-binary @job/job.json
```

Response:

```json
{
  "taskId": "xxxx-xxxx-xxxx"
}
```

When the concurrency limit is reached the answer is 429:

```json
{
  "error": "ERROR: Maximum number of concurrent tasks reached."
}
```

A job that is not acceptable (cannot be parsed, is missing required settings, names a plugin that is not installed, ...) is answered with 400 and the reason in `error`:

```json
{
  "error": "com.wgzhao.addax.core.exception.AddaxException: The configuration is incorrect. ..."
}
```

### 2. Query Task Status

- URL: `/api/status?taskId={taskId}`
- Method: GET
- `status` is one of `RUNNING`, `SUCCESS`, `FAILED`, `CANCELLED`
- An unknown task, or one dropped by the retention bound, answers 404

```json
{
  "taskId": "xxxx-xxxx-xxxx",
  "status": "SUCCESS",
  "result": "Job executed.",
  "error": ""
}
```

When a job fails, `error` quotes the last error the job logged, together with its exit code and the name of its log file:

```json
{
  "taskId": "xxxx-xxxx-xxxx",
  "status": "FAILED",
  "result": "",
  "error": "... ERROR Engine - AddaxException: Cannot find any file in path: [/tmp/no.txt] ... (exit code 2, see addax-xxxx-xxxx-xxxx.log)"
}
```

### 3. Cancel Task

- URL: `/api/cancel?taskId={taskId}`
- Method: POST
- The server sends the job process a termination signal (SIGTERM) and kills it if it has not stopped within 10 seconds

Answer 200:

```json
{
  "taskId": "xxxx-xxxx-xxxx",
  "status": "CANCELLED"
}
```

An unknown task answers 404, a task that already finished answers 409.

## Start and Stop

Use the script `core/src/main/bin/addax-server.sh` to start and stop the service.

### Start Service

```bash
./addax-server.sh start
```

### Set Max Concurrency (e.g., 50) and Run in Background

```bash
./addax-server.sh start -p 50 --daemon
```

### Stop Service

```bash
./addax-server.sh stop
```

Stopping the service also terminates the job processes that are still running.

### Options

| Option               | Description                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `-p, --parallel <n>` | maximum number of concurrently running tasks, default 30 or `$ADDAX_SERVER_PARALLEL`     |
| `--port <port>`      | port to listen on, default 10601                                                         |
| `--bind <address>`   | address to bind to, default all interfaces                                               |
| `--max-tasks <n>`    | finished tasks kept for status queries, default 10000, the oldest ones are dropped first |
| `--task-timeout <n>` | how long a task may run in seconds, no limit by default, a task past it is cancelled     |
| `-h, --help`         | show this help                                                                           |

Priority for the concurrency limit: the command line `-p` or `--parallel` wins, then the environment variable `ADDAX_SERVER_PARALLEL`, then the default of 30.

## Logs

- Server log: `log/addax-server.log` (in background mode the console output goes into `addax-server.out`)
- Job log: every job writes its own file `log/addax-<taskId>.log`

## Notes

- A job runs as the user that started the server and inherits the JVM options of the server; the server has no authentication yet, so do not expose it to an untrusted network
- Every job pays a JVM startup of about 1 to 2 seconds, which does not matter for long jobs
- Job log files are not cleaned up automatically, archive or remove them as needed

---

For more help, refer to other documentation or contact the project maintainers.
