<!-- Shared by RDBMS-derived writer docs. Keep the region names stable. -->

<!-- #region generic-base -->

```text
parameter
├─ connection
│  ├─ jdbcUrl
│  └─ table
├─ driver
├─ username
├─ password
├─ column
├─ preSql
├─ postSql
├─ batchSize
├─ session
└─ ddl
```

<!-- #endregion generic-base -->

<!-- #region derived-base -->

```text
parameter
├─ connection
│  ├─ jdbcUrl
│  ├─ table
│  └─ driver
├─ username
├─ password
├─ column
├─ preSql
├─ postSql
├─ batchSize
├─ session
└─ ddl
```

<!-- #endregion derived-base -->

<!-- #region derived-base-no-credentials -->

```text
parameter
├─ connection
│  ├─ jdbcUrl
│  ├─ table
│  └─ driver
├─ column
├─ preSql
├─ postSql
├─ batchSize
├─ session
└─ ddl
```

<!-- #endregion derived-base-no-credentials -->
