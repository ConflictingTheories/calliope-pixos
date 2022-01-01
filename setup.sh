tsc --outDir .. ./* --downlevelIteration

npm install webpack webpack-cli webpack-dev-server --save-dev
npm install @babel/cli @babel/core @babel/node @babel/preset-env @babel/preset-react @babel/register babel-register --save-dev
npm install babel-loader style-loader css-loader --legacy-peer-deps
npx webpack