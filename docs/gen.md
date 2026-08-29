# 作业配置自动生成（addax gen）

`addax gen` 通过连接串自动生成可直接运行的作业配置文件（JSON），无需手动填写连接信息、表名和字段映射，把配置时间从分钟级降到秒级。

## 用法

```bash
addax gen mysql://user:pass@host:3306/ods --table users \
          --to clickhouse://default@host:8123/ods --table users \
          [--columns a,b,c] [--channel 2] \
          [--password-env SRC_PASS] [--output job.json] [--no-probe]
```

| 参数 | 缺省 | 说明 |
|---|---|---|
| `<源连接串>`（位置参数） | 必填 | 源数据源连接串，见下方格式 |
| `--to <目标连接串>` | 必填 | 目标数据源连接串 |
| `--table <表>` | — | 源/目标表名，各出现一次 |
| `--columns a,b,c` | 探测全列 | 指定列；不指定则自动探测全部列 |
| `--channel N` | 1 | 并发通道数；探测到主键时自动填入 splitPk 提升并发 |
| `--password-env VAR` | — | 密码从环境变量读取，避免出现在命令行 |
| `--output <file>` | stdout | 输出到文件；已存在且未加 `--overwrite` 则报错 |
| `--overwrite` | — | 允许覆盖已存在的输出文件 |
| `--no-probe` | false | 跳过探测，仅拼接插件模板骨架（原行为） |
| `-l` | — | 列出所有 reader/writer 插件名 |

## 连接串格式

```
scheme://user:password@host:port/database
```

- `scheme` 使用 JDBC URL 中的标准名称（`mysql`、`postgresql`、`oracle`、`clickhouse` 等），大小写不敏感，不缩写
- `port` 缺省时按 scheme 使用默认端口
- `database` 为路径段；Oracle 下为 service name，SQLite/Access 下为文件路径
- 密码含特殊字符时建议使用 `--password-env` 或交互输入

| scheme | 默认端口 | 生成的 JDBC URL |
|---|---|---|
| mysql | 3306 | `jdbc:mysql://host:3306/db?useUnicode=true&characterEncoding=utf-8` |
| postgresql | 5432 | `jdbc:postgresql://host:5432/db` |
| oracle | 1521 | `jdbc:oracle:thin:@//host:1521/db` |
| clickhouse | 8123 | `jdbc:clickhouse://host:8123/db` |
| sqlserver | 1433 | `jdbc:sqlserver://host:1433;DatabaseName=db` |
| db2 | 50000 | `jdbc:db2://host:50000/db` |
| sybase | 5000 | `jdbc:sybase:Tds:host:5000/db` |
| hana | 30015 | `jdbc:sap://host:30015/?databaseName=db` |
| sqlite | — | `jdbc:sqlite:db`（db 为文件路径） |
| tdengine | 6030 | `jdbc:TAOS-RS://host:6030/db` |
| databend | 8000 | `jdbc:databend://host:8000/db` |
| hive | 10000 | `jdbc:hive2://host:10000/db` |

## 生成行为

1. **连接探测**：连接源库，自动探测表结构（列名、类型、精度、主键）
2. **列填充**：`column` 自动填充全部探测列（指定 `--columns` 时校验列存在性）
3. **字段映射**：目标表同名列自动匹配；目标缺失列或类型不匹配时**列出警告**，不静默
4. **splitPk**：探测到主键且 `--channel` 大于 1 时自动填入
5. **密码加密**：生成的配置中密码以 `${enc:...}` 密文形式输出（使用 `encrypt_password.sh` 相同的加密逻辑），不在配置中出现明文
6. **写模式**：默认 `insert`，v1 不支持 update 模式
7. **输出**：完整的 `job` JSON（`setting.speed.channel` + `content.reader/writer`），输出到 stdout 或文件（文件权限 600）

## 限制与降级

- 支持 JDBC 系插件（上表所列数据库）；MongoDB、HDFS、Kafka、Redis、FTP 等非 JDBC 插件不支持探测，会降级为模板骨架拼接并给出提示
- v1 仅支持单表同步；多表、transformer、自定义 where 等复杂场景请手动编辑生成的配置
- `--no-probe` 时与原有 `addax.sh gen -r/-w` 行为一致

## 错误处理

| 场景 | 提示 |
|---|---|
| 网络连接失败 | 区分主机不可达 / 端口拒绝，提示检查地址 |
| 认证失败 | 提示检查用户名密码或 `--password-env` |
| 源表不存在 | 报错并列出名称相似的候选表 |
| 目标表不存在 | 报错并列出候选表（v1 不自动建表） |
