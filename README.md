

//install allure
npm install --save-dev allure-playwright allure-commandline
add allure-playwright in playwright.config.ts file in reports section
then run testcases it will generate allure-results folder then run

//to generate allure report after cleaning th allure results 
npx allure generate allure-results --clean -o allure-report

 //open allure report
 npx allure open allure-report