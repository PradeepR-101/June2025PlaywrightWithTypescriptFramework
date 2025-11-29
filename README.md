

//install allure
npm install --save-dev allure-playwright allure-commandline
add allure-playwright in playwright.config.ts file in reports section
then run testcases it will generate allure-results folder then run

//to generate allure report after cleaning th allure results 
npx allure generate allure-results --clean -o allure-report

 //open allure report
 npx allure open allure-report


 //to install csv parser 
 npm install csv-parse
 npm install csv-parse/sync

 //install custom playwright html reporter
 npm i -D playwright-html-reporter

 //run scripts commands mentioned in package.json file
 npm run test:qa 

 //right clickon index.html under playwright-report folde r then copy path then paste it in google to see the report

//playwright doc - search for tag - clickon tags test
 //--grep "@sanity|@smoke" => test should have atlest sanity or smoke then those testcases will execute,
 //--grep "@sanity" --grep "@smoke" => tests should have both sanity and smoke tags in testcase name or in tag 
 //npx playwright test --grep "(?=.*@fast)(?=.*@slow)" => tests should have both sanity and smoke tags in testcase name or in tag 

 //if folders are greyed out then those folders added in .gitignore file 

 //github is microsoft product now

 //ubuntu means linux machine

 //action/checkout@v4 - these are tags in yaml file
 //npm ci - means continous integration
 //shell script in yaml file
 //artifacts means reports
 //echo - means print something on the console

//2 settings
 //1 github - goto settings - actions - general (give permission here) - workflow permission - read and write (select radio button)
 //2 github - goto settings - pages - build and deployment - deploy from a branch (select source as deploy from a branch) - branch as master
 //modified



 //once gh-pages generated after first successful execution chnage below settings
 //3 github - goto settings - pages - build and deployment - deploy from a branch (select source as deploy from a branch) - branch as gh-pages
 //then click on the reports in readme file to check the reports





 # PWFWDemo Automation Reports

Welcome to the **June2025PWFramework** automation project. Below you can find the latest test results and HTML reports.

---

## Workflow Status

[![Playwright Tests](https://github.com/PradeepR-101/June2025PlaywrightWithTypescriptFramework/actions/workflows/playwright.yml/badge.svg)](https://github.com/PradeepR-101/June2025PlaywrightWithTypescriptFramework/actions/workflows/playwright.yml)

---

## HTML Reports

Click the badges below to view the latest reports published via GitHub Pages:

[![Playwright Report](https://img.shields.io/badge/Playwright-Report-blue)](https://PradeepR-101.github.io/June2025PlaywrightWithTypescriptFramework/playwright-report/index.html)
[![Playwright HTML Reporter](https://img.shields.io/badge/Playwright_HTML-Report-green)](https://PradeepR-101.github.io/June2025PlaywrightWithTypescriptFramework/playwright-html-report/index.html)
[![Allure Report](https://img.shields.io/badge/Allure-Report-red)](https://PradeepR-101.github.io/June2025PlaywrightWithTypescriptFramework/allure-report/index.html)

---

## Notes

- Playwright HTML report is generated automatically from `npx playwright test`.  
- Allure report is generated from the `allure-results` folder.  
- Both reports are published to `gh-pages` branch and updated on each workflow run.
