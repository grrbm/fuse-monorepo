pm2 stop patient-api
yarn build
pm2 reload patient-api
pm2 logs patient-api