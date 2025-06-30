# 0.15.1

Upgraded dependencies

# 0.15.0

Reorganised `dist` files: splitted `postgres` and `sqlite`.
`calustra` will import `postgres` by default.

```js
import {getConnection} from 'calustra' // imports postgres
import {getConnection} from 'calustra/postgres'
import {getConnection} from 'calustra/sqlite'
```

# 0.14.0

Upgraded `xeira`, which means Node >= 21

# 0.13.1

Upgraded `cacheiro` to `0.3.1`


# 0.11.0

Upgraded `cacheiro` to `0.1.1`:
- `getConnection` is now async.
- added `options.cache` to customize `calustra`'s cache usage
- removed `options.nocache` accordingly (now it is `cache: false`)

