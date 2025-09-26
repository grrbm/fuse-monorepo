pm2 stop admin-frontend
npm run build
pm2 reload admin-frontend
pm2 logs admin-frontend