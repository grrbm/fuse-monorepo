yarn
rm -rf .next
pm2 stop admin-frontend
yarn build
pm2 reload admin-frontend
pm2 logs admin-frontend