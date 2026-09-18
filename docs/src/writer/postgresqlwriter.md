# Postgresql Writer

Postgresql Writer 插件实现了写入数据到 [PostgreSQL](https://postgresql.org) 数据库库表的功能。

## 示例

以下配置演示从 postgresql 指定的表读取数据，并插入到具有相同表结构的另外一张表中，用来测试该插件所支持的数据类型。

### 表结构信息

假定建表语句以及输入插入语句如下：

<<<@/public/assets/sql/postgresql.sql

创建需要插入的表的语句如下:

```sql
create table addax_tbl1 as select * from addax_tbl where 1=2;
```

### 任务配置

以下是配置文件

<<<@/public/assets/jobs/pgwriter.json

将上述配置文件保存为 `job/pg2pg.json`

### 执行采集命令

执行以下命令进行数据采集

```bash
bin/addax.sh job/pg2pg.json
```

## 参数说明

该插件基于 [RDBMS Writer](rdbmswriter) 实现，因此可以参考 RDBMS Writer 的所有配置项。

### writeMode

默认情况下， 采取 `insert into` 语法写入 postgresql 表，如果你希望采取主键存在时更新，不存在则写入的方式， 可以使用 `update` 模式。假定表的主键为 `id` ,则 `writeMode` 配置方法如下：

```json
"writeMode": "update(id)"
```

如果是联合唯一索引，则配置方法如下：

```json
"writeMode": "update(col1, col2)"
```

注： `update` 模式在 `3.1.6` 版本首次增加，之前版本并不支持。

## 类型转换

目前 PostgresqlWriter 支持大部分 PostgreSQL 类型，但也存在部分没有支持的情况，请注意检查你的类型。

下面列出 PostgresqlWriter 针对 PostgreSQL 类型转换列表:

| Addax 内部类型 | PostgreSQL 数据类型                                  |
| -------------- | ---------------------------------------------------- |
| Long           | bigint, bigserial, integer, smallint, serial         |
| Double         | double precision, money, numeric, real               |
| String         | varchar, char, text, inet,cidr,macaddr,uuid,xml,json |
| Date           | date, time, timestamp                                |
| Boolean        | bool, bit(1)                                         |
| Bytes          | bytea, bit(n)                                        |

## bit 类型写入

`bit(n)`（n > 1）列接受以下几种来源形式，按目标列声明的宽度精确存放：

| 来源列类型  | 含义                                                                           | 示例            |
| ----------- | ------------------------------------------------------------------------------ | --------------- |
| Bytes       | 打包的位值，每 8 位一个字节，高位在前，即 RDBMS reader 读 `bit` 列时给出的形式 | `0x05` → `101`  |
| String      | 逐字符的位串，只接受 `0` 和 `1`                                                | `"101"` → `101` |
| Long/Double | 数值本身，位模式即该数的二进制，且必须是整数                                   | `5` → `101`     |
| Boolean     | 单个位，`bit(1)` 列走这条路径                                                  | `true` → `1`    |

- 位数不足时左侧补零；`bit varying` 没有声明宽度，按值本身的位数写入。
- 以下情况会被记为脏数据（受 `errorLimit` 控制）：位串中出现 `0`/`1` 以外的字符、数值带小数部分、位数超过目标列宽度。
- 十进制数值写成字符串不会被按十进制解析，例如 `"255"` 不是 255 而是非法位串，请把源列声明为 long 或 double。

## 已知限制

除以上列出的数据类型外，其他数据类型理论上均为转为字符串类型，但不确保准确性
