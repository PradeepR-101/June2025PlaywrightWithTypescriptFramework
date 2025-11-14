import { Locator, Page } from '@playwright/test';
import { ElementUtil } from '../utils/ElementUtil';
import { LoginPage } from '../pages/LoginPage';



export class ResultsPage{

    //1. page locators/objects/OR:
    private readonly page: Page;
    private readonly eleUtil: ElementUtil;
    private readonly results: Locator;
   

    //2. page class constructor...
    constructor(page: Page) {
        this.page = page;
        this.eleUtil = new ElementUtil(page);
        this.results = page.locator('.product-thumb');
       
    }

    //3. page actions:
    async getSearchResultsCount(): Promise<number> {
        return await this.results.count();
    }
    
    



}