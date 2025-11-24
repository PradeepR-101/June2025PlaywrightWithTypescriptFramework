import { test, expect } from '../fixtures/dataFixture';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

function getRandomEmail() : string{
    let randomValue = Math.random().toString(36).substring(2, 9);
    return `auto_${randomValue}@nal.com`;
}


    
test(`Register a user from CSV`, async ({ regData, page, baseURL }) => {
    
    for (const user of regData) {
        let loginPage = new LoginPage(page);
                await loginPage.goToLoginPage(baseURL);
                let registerPage: RegisterPage = await loginPage.navigateToRegisterPage();
                let isUserRegistered: boolean = await registerPage.registerUser(
                    user.firstName,
                    user.lastName,
                    getRandomEmail(),
                    user.telephone,
                    user.password, 
                    user.subscribeNewsletter);
                expect(isUserRegistered).toBeTruthy();
    }


})


