module.exports= [
  {
    query: `
    SELECT * 
      FROM articles
    `,
    tables: ['articles']
  },
  {
    query: `
    SELECT * 
      FROM articles 
      JOIN authors 
        ON authors.id = articles.author_id 
    WHERE author.name = 'John Doe'
    `,
    tables: ['articles', 'authors']
  },
  {
    query: `
    SELECT title, text
      FROM (SELECT articles.*
              FROM articles 
              JOIN authors 
                ON authors.id = articles.author_id 
            WHERE author.name = 'John Doe'
          ) AS sub
    `,
    tables: ['articles', 'authors']
  },
  {
    query: `
    WITH my_alias AS (
      SELECT author, title, text
        FROM articles
      WHERE author = 'John Doe'
    )
    SELECT s.count
      FROM my_alias AS a
      JOIN stars    AS s ON s.author = a.author
    WHERE s.source = 'github'
  `,
    tables: ['articles', 'stars']
  },
  {
    query: `
    SELECT f.attnum AS number, f.attname AS name, f.attnum,  
                f.attnotnull AS notnull, 
                f.atttypid as type_id,
                -- pg_catalog.format_type(f.atttypid,f.atttypmod) AS type,  
                CASE  
                    WHEN p.contype = 'p' THEN 't'  
                    ELSE 'f'  
                END AS primarykey,  
                CASE  
                    WHEN p.contype = 'u' THEN 't'  
                    ELSE 'f'
                END AS uniquekey
                -- CASE
                --     WHEN p.contype = 'f' THEN g.relname
                -- END AS foreignkey,
                -- CASE
                --     WHEN p.contype = 'f' THEN p.confkey
                -- END AS foreignkey_fieldnum,
                -- CASE
                --     WHEN p.contype = 'f' THEN g.relname
                -- END AS foreignkey,
                -- CASE
                --     WHEN p.contype = 'f' THEN p.conkey
                -- END AS foreignkey_connnum,
                -- CASE
                --     WHEN f.atthasdef = 't' THEN d.adsrc
                -- END AS default
            FROM pg_attribute f  
            JOIN pg_class c ON c.oid = f.attrelid  
            JOIN pg_type t ON t.oid = f.atttypid  
      LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = f.attnum  
      LEFT JOIN pg_namespace n ON n.oid = c.relnamespace  
      LEFT JOIN pg_constraint p ON p.conrelid = c.oid AND f.attnum = ANY (p.conkey)  
      LEFT JOIN pg_class AS g ON p.confrelid = g.oid  
          WHERE c.relkind = 'r'::char  
            AND n.nspname = 'public'
            AND c.relname = 'articles'
            AND f.attnum > 0 
        ORDER BY number
    `,
    tables: ['pg_attribute', 'pg_class', 'pg_type', 'pg_attrdef', 'pg_namespace', 'pg_constraint']
  },
  {
    query: `
    DROP TABLE articles
    `,
    tables: ['articles']
  },
  {
    query: `
    DROP TABLE IF EXISTS articles
    `,
    tables: ['articles']
  },
  {
    query: `
    ALTER TABLE articles ADD COLUMN created_at date
    `,
    tables: ['articles']
  },
  {
    query: `
    SELECT m.name as tableName, 
           p.cid as number,
           p.name as columnName,
           p.type,
           p.'notnull' as nulla,
           p.dflt_value,
           p.pk
      FROM sqlite_master m
  LEFT OUTER JOIN pragma_table_info((m.name)) p
        ON m.name <> p.name
     WHERE m.name = ?
  ORDER BY tableName, number`,
  tables: ['sqlite_master', 'pragma_table_info']  
  },
  {
    query: `
    SELECT name 
      FROM sqlite_schema 
     WHERE type = 'table'
       AND name NOT LIKE 'sqlite_%'
 ORDER BY 1 
    `,
    tables: ['sqlite_schema']
  },
  {
    query: `
    INSERT INTO articles
      (name, description, words)
    VALUES
      ($1, $2, $3)
    `,
    tables: ['articles']
  },
  {
    query: `
    UPDATE articles
       SET name = 'table'
     WHERE id = $18
    `,
    tables: ['articles']
  }
  
]