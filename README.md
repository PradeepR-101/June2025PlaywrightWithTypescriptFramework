

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