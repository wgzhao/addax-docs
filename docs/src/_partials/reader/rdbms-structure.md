<!-- Shared by RDBMS-derived reader docs. Keep the region names stable. -->

<!-- #region generic-base -->

```text
parameter
├─ connection
│  ├─ jdbcUrl
│  ├─ table
│  └─ querySql
├─ username
├─ password
├─ column
├─ excludeColumn
├─ splitPk
├─ autoPk
├─ where
├─ session
├─ fetchSize
└─ driver
```

<!-- #endregion generic-base -->

<!-- #region derived-base -->

```text
parameter
├─ connection
│  ├─ jdbcUrl
│  ├─ table
│  ├─ querySql
│  └─ driver
├─ username
├─ password
├─ column
├─ excludeColumn
├─ splitPk
├─ autoPk
├─ where
├─ session
└─ fetchSize
```

<!-- #endregion derived-base -->

<!-- #region derived-base-no-credentials -->

```text
parameter
├─ connection
│  ├─ jdbcUrl
│  ├─ table
│  ├─ querySql
│  └─ driver
├─ column
├─ excludeColumn
├─ splitPk
├─ autoPk
├─ where
├─ session
└─ fetchSize
```

<!-- #endregion derived-base-no-credentials -->
