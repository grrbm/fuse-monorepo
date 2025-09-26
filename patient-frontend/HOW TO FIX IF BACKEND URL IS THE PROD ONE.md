## HOW TO FIX IF BACKEND URL IS THE PROD ONE INSTEAD OF LOCALHOST:3001

# The issue is that your browser is still using the cached compiled JavaScript files

# The URL is baked into the compiled code. You need to force a

# complete rebuild:

# step 1

rm -rf .next

# step 2

yarn build

# step 3

yarn dev
