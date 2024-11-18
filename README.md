steps while creating this dynamic form generator are written below:-
1.Create a Github repo and clone it into local folder 
2.After that create react project using "npm create vite@latest my-project" command
3.after install tailwind css in this react project using command below:-
"npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p"
4.In tailwind config.js file added tailwind import and also in the index.css write below code:-
"/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}",
for index.css
"@tailwind base;
@tailwind components;
@tailwind utilities;"

after all this write logic behind the dynamic form geneartor and add all valid validation in this code.
for json schemas use one of the example which given in the assesment form

for deploy a app on netlify use command "npm run build" and then deploy it manually