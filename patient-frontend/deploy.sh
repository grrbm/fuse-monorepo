rm -rf .next
pm2 stop patient-frontend
yarn build
pm2 reload patient-frontend
pm2 logs patient-frontend