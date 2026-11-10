# 命令行工具

这里介绍 [addax.sh](https://github.com/wgzhao/Addax/blob/master/core/src/main/bin/addax.sh) 命令行工具的使用方法。

## 命令行工具

Addax 提供了一个命令行工具 `addax.sh`，用于执行 Addax 作业。该工具位于 Addax 安装目录的 `bin` 目录下。

## 使用方法

执行 Addax 作业的基本命令格式如下：

```bash
bin/addax.sh <job_file>
```

其中 `<job_file>` 是一个 JSON 格式的作业配置文件，包含了数据源的读取和写入配置。

## 参数

`addax.sh` 命令行工具支持以下参数：

- `-h`, `--help`: 显示帮助信息。
- `-v`, `--version`: 显示 Addax 的版本信息。
- `-l`, `--log`: 指定日志文件路径，默认是在 `$ADDAX_HOME/log` 目录下。
- `-d`, `--debug`: 启用调试模式，详见 [调试模式](debug.md)。
- `-L`, `--log-level`: 设置日志级别，支持 `DEBUG`, `INFO`, `WARN`, `ERROR` 等级别，默认是 `INFO`。
- `-j`, `--jvm`: 指定 JVM 参数，可以传递给 Java 虚拟机的参数。
- `-p`, `--params` : 传递额外的参数给作业配置文件，可以在作业配置中使用 `${param}` 的方式引用这些参数。

### params 参数说明

`-p`, `--params` 参数用来向设置某些配置任务的参数，使得作业配置文件可以更加灵活。可以在作业配置文件中使用 `${param}` 的方式引用这些参数。

假定作业配置文件中有如下内容：

```json
{
  "job": {
    "settings": {
      "param1": "${param1}",
      "param2": "${param2}"
    },
    "content": {
      "reader": {
        "name": "mysqlreader",
        "parameter": {
          "username": "${username}",
          "password": "${password}"
        }
      },
      "writer": {
        "name": "mysqlwriter",
        "parameter": {
          "username": "${username}",
          "password": "${password}"
        }
      }
    }
  }
}
```

执行命令时，可以使用 `-p` 参数传递参数：

```bash
bin/addax.sh job/test.json -p "-Dusername=root -Dpassword=123456 -Dparam1=value1 -Dparam2=value2"
```

日期变量（`${curr_*}`、`${biz_*}`）不再由 `addax.sh` 注入。原先的 `biz_*` 固定按“昨天”计算，无法适配交易日历、补采等场景，现在统一由调度端提供：

- 使用 [addax-admin](https://github.com/wgzhao/addax-admin) 调度时，管理端会按任务的业务日期填充这些变量，补采时也会按指定的业务日期生成。
- 直接运行 `addax.sh` 时，通过 `-p` 显式传入，例如：

```bash
bin/addax.sh job/test.json -p "-Dbiz_date_short=20250716 -Dcurr_date_short=20250717"
```

未传入的占位符会原样保留（例如 `${biz_date_short}`），不会被替换。
