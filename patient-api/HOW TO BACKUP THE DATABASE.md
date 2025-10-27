## RUN THIS COMMAND ON PROD ENV

pg_dump -h database-1.cv8g82kya3xt.us-east-2.rds.amazonaws.com -p 5432 -U fusehealth_user -d fusehealth_database --verbose --clean --create > full_database_dump_02_Oct_2025.sql

e4Uv$^9hJG:K\*)s%

OR LOCALLY:

pg_dump -h localhost -p 5432 -U fusehealth_user -d fusehealth_database --verbose --clean --create > full_database_dump_27_Oct_2025.sql
