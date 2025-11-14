import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { ResultsPage } from '../pages/ResultsPage';

//data provider for product search key and results count
let searchData = [
    { searchkey: 'macbook', resultscount: 3 },
    { searchkey: 'samsung', resultscount: 2 },
    { searchkey: 'imac', resultscount: 1 },
    {searchkey: 'canon', resultscount: 1},
    {searchkey: 'Dummy', resultscount: 0},

];


for (let product of searchData) {
    test(`verify product search ${product.searchkey}`, async ({ page }) => {

    let loginPage = new LoginPage(page);
    await loginPage.goToLoginPage();
    let homePage: HomePage = await loginPage.doLogin('pwtest@nal.com', 'test123');
    let resultsPage: ResultsPage = await homePage.doSearch(product.searchkey);
    expect (await resultsPage.getSearchResultsCount()).toBe(product.resultscount);

});

}

