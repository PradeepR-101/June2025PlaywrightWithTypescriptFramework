import { ResultsPage } from '../pages/ResultsPage';
import { test, expect } from '../fixtures/baseFixtures'


//data provider for product search key and results count
let searchData = [
    { searchkey: 'macbook', resultscount: 3 },
    { searchkey: 'samsung', resultscount: 2 },
    { searchkey: 'imac', resultscount: 1 },
    {searchkey: 'canon', resultscount: 1},
    {searchkey: 'Dummy', resultscount: 0},

];


for (let product of searchData) {
    test(`verify product search ${product.searchkey}`, async ({ homePage }) => {

    let resultsPage: ResultsPage = await homePage.doSearch(product.searchkey);
    expect (await resultsPage.getSearchResultsCount()).toBe(product.resultscount);

});

}

