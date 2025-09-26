## Run this:

npx sequelize-cli migration:generate --name create_users_table

## To run all migrations:

## run this one-liner (on prod server !!):

DATABASE_URL="postgresql://fusehealth_user:e4Uv%24%5E9hJG%3AK%2A%29s%25@database-1.cv8g82kya3xt.us-east-2.rds.amazonaws.com:5432/fusehealth_database" npx sequelize-cli db:migrate --env production

## To run all seeders:

## run this one-liner (on prod server !!):

DATABASE_URL="postgresql://fusehealth_user:e4Uv%24%5E9hJG%3AK%2A%29s%25@database-1.cv8g82kya3xt.us-east-2.rds.amazonaws.com:5432/fusehealth_database" npx sequelize-cli db:seed:all --env production

## or single seeder:

DATABASE_URL="postgresql://fusehealth_user:e4Uv%24%5E9hJG%3AK%2A%29s%25@database-1.cv8g82kya3xt.us-east-2.rds.amazonaws.com:5432/fusehealth_database" npx sequelize-cli db:seed --seed 20250913000001-create-nad-products.js --env production