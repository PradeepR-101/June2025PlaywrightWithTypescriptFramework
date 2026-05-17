import { Page, Locator, expect, FrameLocator, Download, FileChooser } from '@playwright/test';

type flexibleLocator = string | Locator;

export class ElementUtils {

    private page: Page;
    private defaultTimeOut: number = 30000;

    constructor(page: Page, timeOut: number = 30000) {
        this.page = page;
        this.defaultTimeOut = timeOut;
    }

    /**
     * Convert string to Locator, else return the Locator on the basis of given index
     */
    private getLocator(locator: flexibleLocator, index?: number): Locator {
        if (typeof locator === 'string') {
            if (index !== undefined) {
                return this.page.locator(locator).nth(index);
            } else {
                return this.page.locator(locator).first();
            }
        } else {
            if (index !== undefined) {
                return locator.nth(index);
            } else {
                return locator.first();
            }
        }
    }


    // ========================== Click Actions ========================== //

    /**
     * Click on an element
     */
    async click(locator: flexibleLocator, options?: { force?: boolean; timeout?: number }, index?: number): Promise<void> {
        await this.getLocator(locator, index).click({
            force: options?.force,
            timeout: options?.timeout || this.defaultTimeOut
        });
        console.log(`Clicked on element: ${locator}`);
    }

    /**
     * Double click on element
     */
    async doubleClick(locator: flexibleLocator): Promise<void> {
        await this.getLocator(locator).dblclick({ timeout: this.defaultTimeOut });
        console.log(`Double Clicked on element: ${locator}`);
    }

    /**
     * Right click on element
     */
    async rightClick(locator: flexibleLocator): Promise<void> {
        await this.getLocator(locator).click({ button: 'right', timeout: this.defaultTimeOut });
        console.log(`Right Clicked on element: ${locator}`);
    }

    /**
     * Click and hold (mouse down) on an element
     */
    async clickAndHold(locator: flexibleLocator): Promise<void> {
        await this.getLocator(locator).hover({ timeout: this.defaultTimeOut });
        await this.page.mouse.down();
        console.log(`Click and hold on element: ${locator}`);
    }

    /**
     * Click at a specific position within element (x, y are offsets from the element's top-left corner)
     */
    async clickAtPosition(locator: flexibleLocator, x: number, y: number): Promise<void> {
        await this.getLocator(locator).click({ position: { x, y }, timeout: this.defaultTimeOut });
        console.log(`Clicked at position (${x}, ${y}) on element: ${locator}`);
    }

    /**
     * Click with modifier key (e.g. Shift, Control, Alt, Meta)
     */
    async clickWithModifier(locator: flexibleLocator, modifier: 'Shift' | 'Control' | 'Alt' | 'Meta'): Promise<void> {
        await this.getLocator(locator).click({ modifiers: [modifier], timeout: this.defaultTimeOut });
        console.log(`Clicked with modifier ${modifier} on element: ${locator}`);
    }

    /**
     * Click if element is visible, skip otherwise
     */
    async clickIfVisible(locator: flexibleLocator, timeout: number = 3000): Promise<boolean> {
        const visible = await this.waitForElementVisible(locator, timeout);
        if (visible) {
            await this.click(locator);
            return true;
        }
        console.log(`Element not visible, skipping click: ${locator}`);
        return false;
    }

    /**
     * Click all elements matching the locator
     */
    async clickAll(locator: string): Promise<void> {
        const elements = await this.page.locator(locator).all();
        for (const el of elements) {
            await el.click({ timeout: this.defaultTimeOut });
        }
        console.log(`Clicked all elements matching: ${locator}`);
    }


    // ========================== Keyboard & Input ========================== //

    /**
     * Fill text into an input field
     */
    async fill(locator: flexibleLocator, text: string): Promise<void> {
        await this.getLocator(locator).fill(text, { timeout: this.defaultTimeOut });
        console.log(`Filled text: "${text}" into element: ${locator}`);
    }

    /**
     * Type text with delay (simulates human typing; default delay: 500ms)
     */
    async type(locator: flexibleLocator, text: string, delay: number = 500): Promise<void> {
        await this.getLocator(locator).pressSequentially(text, { delay, timeout: this.defaultTimeOut });
        console.log(`Typed text: "${text}" into element: ${locator}`);
    }

    /**
     * Clear the value of an input field
     */
    async clear(locator: flexibleLocator): Promise<void> {
        await this.getLocator(locator).clear({ timeout: this.defaultTimeOut });
        console.log(`Cleared element: ${locator}`);
    }

    /**
     * Clear field and fill with new value
     */
    async clearAndFill(locator: flexibleLocator, text: string): Promise<void> {
        await this.clear(locator);
        await this.fill(locator, text);
        console.log(`Cleared and filled "${text}" into element: ${locator}`);
    }

    /**
     * Press a single key on an element (e.g. 'Enter', 'Tab', 'Escape', 'ArrowDown')
     */
    async pressKey(locator: flexibleLocator, key: string): Promise<void> {
        await this.getLocator(locator).press(key, { timeout: this.defaultTimeOut });
        console.log(`Pressed key: "${key}" on element: ${locator}`);
    }

    /**
     * Press keyboard shortcut globally on the page (e.g. 'Control+A', 'Shift+Tab')
     */
    async pressKeyboardShortcut(shortcut: string): Promise<void> {
        await this.page.keyboard.press(shortcut);
        console.log(`Pressed keyboard shortcut: "${shortcut}"`);
    }

    /**
     * Press Tab to move focus to the next element
     */
    async pressTab(): Promise<void> {
        await this.page.keyboard.press('Tab');
        console.log(`Pressed Tab`);
    }

    /**
     * Press Enter on a given element
     */
    async pressEnter(locator: flexibleLocator): Promise<void> {
        await this.pressKey(locator, 'Enter');
    }

    /**
     * Select all text in an input field (Ctrl+A / Cmd+A)
     */
    async selectAllText(locator: flexibleLocator): Promise<void> {
        await this.getLocator(locator).focus();
        await this.page.keyboard.press('Control+A');
        console.log(`Selected all text in element: ${locator}`);
    }

    /**
     * Upload file(s) to a file input element
     */
    async uploadFile(locator: flexibleLocator, filePaths: string | string[]): Promise<void> {
        await this.getLocator(locator).setInputFiles(filePaths);
        console.log(`Uploaded file(s): ${filePaths} to element: ${locator}`);
    }

    /**
     * Upload file via file chooser dialog (for custom upload triggers)
     */
    async uploadFileViaChooser(triggerLocator: flexibleLocator, filePath: string): Promise<void> {
        const [fileChooser]: [FileChooser,void] = await Promise.all([
            this.page.waitForEvent('filechooser'),
            this.click(triggerLocator)
        ]);
        await fileChooser.setFiles(filePath);
        console.log(`Uploaded file via chooser: ${filePath}`);
    }

    /**
     * Remove files from a file input
     */
    async clearFileInput(locator: flexibleLocator): Promise<void> {
        await this.getLocator(locator).setInputFiles([]);
        console.log(`Cleared file input: ${locator}`);
    }


    // ========================== Mouse Actions ========================== //

    /**
     * Hover over an element
     */
    async hover(locator: flexibleLocator, index?: number): Promise<void> {
        await this.getLocator(locator, index).hover({ timeout: this.defaultTimeOut });
        console.log(`Hovered over element: ${locator}`);
    }

    /**
     * Drag and drop from one element to another
     */
    async dragAndDrop(sourceLocator: flexibleLocator, targetLocator: flexibleLocator): Promise<void> {
        await this.getLocator(sourceLocator).dragTo(this.getLocator(targetLocator), { timeout: this.defaultTimeOut });
        console.log(`Dragged from: ${sourceLocator} to: ${targetLocator}`);
    }

    /**
     * Drag element by offset (x, y pixels)
     */
    async dragByOffset(locator: flexibleLocator, xOffset: number, yOffset: number): Promise<void> {
        const el = this.getLocator(locator);
        const box = await el.boundingBox();
        if (!box) throw new Error(`Element not found or not visible: ${locator}`);
        const startX = box.x + box.width / 2;
        const startY = box.y + box.height / 2;
        await this.page.mouse.move(startX, startY);
        await this.page.mouse.down();
        await this.page.mouse.move(startX + xOffset, startY + yOffset, { steps: 10 });
        await this.page.mouse.up();
        console.log(`Dragged element: ${locator} by offset (${xOffset}, ${yOffset})`);
    }

    /**
     * Scroll element into view
     */
    async scrollIntoView(locator: flexibleLocator): Promise<void> {
        await this.getLocator(locator).scrollIntoViewIfNeeded({ timeout: this.defaultTimeOut });
        console.log(`Scrolled element into view: ${locator}`);
    }

    /**
     * Scroll the page by a given offset (pixels)
     */
    async scrollPage(x: number, y: number): Promise<void> {
        await this.page.mouse.wheel(x, y);
        console.log(`Scrolled page by x: ${x}, y: ${y}`);
    }

    /**
     * Scroll to the top of the page
     */
    async scrollToTop(): Promise<void> {
        await this.page.keyboard.press('Control+Home');
        console.log(`Scrolled to top of page`);
    }

    /**
     * Scroll to the bottom of the page
     */
    async scrollToBottom(): Promise<void> {
        await this.page.keyboard.press('Control+End');
        console.log(`Scrolled to bottom of page`);
    }

    /**
     * Scroll within an element (e.g. a scrollable container)
     */
    async scrollWithinElement(locator: flexibleLocator, x: number, y: number): Promise<void> {
        await this.getLocator(locator).evaluate(
            (el, { x, y }) => el.scrollBy(x, y),
            { x, y }
        );
        console.log(`Scrolled within element: ${locator} by x: ${x}, y: ${y}`);
    }


    // ========================== Text & Attribute Getters ========================== //

    /**
     * Get text content of an element
     */
    async getText(locator: flexibleLocator): Promise<string | null> {
        return await this.getLocator(locator).textContent({ timeout: this.defaultTimeOut });
    }

    /**
     * Get inner text of an element (trimmed)
     */
    async getInnerText(locator: flexibleLocator): Promise<string> {
        return (await this.getLocator(locator).innerText({ timeout: this.defaultTimeOut })).trim();
    }

    /**
     * Get inner HTML of an element
     */
    async getInnerHTML(locator: flexibleLocator): Promise<string> {
        return await this.getLocator(locator).innerHTML({ timeout: this.defaultTimeOut });
    }

    /**
     * Get attribute value of an element
     */
    async getAttributeValue(locator: flexibleLocator, attributeName: string): Promise<string | null> {
        return await this.getLocator(locator).getAttribute(attributeName, { timeout: this.defaultTimeOut });
    }

    /**
     * Get value of a CSS property on an element
     */
    async getCSSProperty(locator: flexibleLocator, property: string): Promise<string> {
        return await this.getLocator(locator).evaluate(
            (el, prop) => window.getComputedStyle(el).getPropertyValue(prop),
            property
        );
    }

    /**
     * Get input value of a text field
     */
    async getInputValue(locator: flexibleLocator): Promise<string> {
        return await this.getLocator(locator).inputValue({ timeout: this.defaultTimeOut });
    }

    /**
     * Get all inner texts from multiple matched elements
     */
    async getAllInnerTexts(locator: flexibleLocator): Promise<string[]> {
        return await this.getLocator(locator).allInnerTexts();
    }

    /**
     * Get all text contents from multiple matched elements
     */
    async getAllTextContents(locator: string): Promise<(string | null)[]> {
        return await this.page.locator(locator).allTextContents();
    }

    /**
     * Get the count of matched elements
     */
    async getElementCount(locator: string): Promise<number> {
        const count = await this.page.locator(locator).count();
        console.log(`Element count for "${locator}": ${count}`);
        return count;
    }

    /**
     * Get the bounding box (position + size) of an element
     */
    async getBoundingBox(locator: flexibleLocator): Promise<{ x: number; y: number; width: number; height: number } | null> {
        return await this.getLocator(locator).boundingBox();
    }

    /**
     * Get the placeholder text of an input field
     */
    async getPlaceholder(locator: flexibleLocator): Promise<string | null> {
        return await this.getAttributeValue(locator, 'placeholder');
    }

    /**
     * Get selected option label in a <select> dropdown
     */
    async getSelectedOptionText(locator: flexibleLocator): Promise<string> {
        return await this.getLocator(locator).evaluate(
            (el) => (el as HTMLSelectElement).options[(el as HTMLSelectElement).selectedIndex]?.text ?? ''
        );
    }

    /**
     * Get all option texts from a <select> dropdown
     */
    async getAllSelectOptions(locator: flexibleLocator): Promise<string[]> {
        return await this.getLocator(locator).evaluate(
            (el) => Array.from((el as HTMLSelectElement).options).map(o => o.text)
        );
    }


    // ========================== Element State Checks ========================== //

    async isVisible(locator: flexibleLocator, index?: number): Promise<boolean> {
        return await this.getLocator(locator, index).isVisible({ timeout: this.defaultTimeOut });
    }

    async isHidden(locator: flexibleLocator): Promise<boolean> {
        return await this.getLocator(locator).isHidden({ timeout: this.defaultTimeOut });
    }

    async isEnabled(locator: flexibleLocator): Promise<boolean> {
        return await this.getLocator(locator).isEnabled({ timeout: this.defaultTimeOut });
    }

    async isDisabled(locator: flexibleLocator): Promise<boolean> {
        return await this.getLocator(locator).isDisabled({ timeout: this.defaultTimeOut });
    }

    async isChecked(locator: flexibleLocator): Promise<boolean> {
        return await this.getLocator(locator).isChecked({ timeout: this.defaultTimeOut });
    }

    async isEditable(locator: flexibleLocator): Promise<boolean> {
        return await this.getLocator(locator).isEditable({ timeout: this.defaultTimeOut });
    }

    /**
     * Check if element is present in the DOM (attached), regardless of visibility
     */
    async isPresent(locator: string): Promise<boolean> {
        const count = await this.page.locator(locator).count();
        return count > 0;
    }

    /**
     * Check if element contains specific text
     */
    async hasText(locator: flexibleLocator, text: string): Promise<boolean> {
        const content = await this.getInnerText(locator);
        return content.includes(text);
    }

    /**
     * Check if an element has a specific CSS class
     */
    async hasClass(locator: flexibleLocator, className: string): Promise<boolean> {
        const classAttr = await this.getAttributeValue(locator, 'class');
        return classAttr ? classAttr.split(' ').includes(className) : false;
    }

    /**
     * Check if an attribute exists on an element
     */
    async hasAttribute(locator: flexibleLocator, attributeName: string): Promise<boolean> {
        const value = await this.getAttributeValue(locator, attributeName);
        return value !== null;
    }


    // ========================== Checkbox & Radio ========================== //

    /**
     * Check a checkbox or radio button (does nothing if already checked)
     */
    async check(locator: flexibleLocator): Promise<void> {
        await this.getLocator(locator).check({ timeout: this.defaultTimeOut });
        console.log(`Checked element: ${locator}`);
    }

    /**
     * Uncheck a checkbox (does nothing if already unchecked)
     */
    async uncheck(locator: flexibleLocator): Promise<void> {
        await this.getLocator(locator).uncheck({ timeout: this.defaultTimeOut });
        console.log(`Unchecked element: ${locator}`);
    }

    /**
     * Set checkbox to a specific state
     */
    async setCheckbox(locator: flexibleLocator, checked: boolean): Promise<void> {
        const currentState = await this.isChecked(locator);
        if (currentState !== checked) {
            checked ? await this.check(locator) : await this.uncheck(locator);
        }
        console.log(`Set checkbox: ${locator} to: ${checked}`);
    }


    // ========================== Select / Dropdown ========================== //

    async selectByText(locator: flexibleLocator, text: string): Promise<void> {
        await this.getLocator(locator).selectOption({ label: text }, { timeout: this.defaultTimeOut });
        console.log(`Selected option by text: "${text}" from: ${locator}`);
    }

    async selectByValue(locator: flexibleLocator, value: string): Promise<void> {
        await this.getLocator(locator).selectOption({ value }, { timeout: this.defaultTimeOut });
        console.log(`Selected option by value: "${value}" from: ${locator}`);
    }

    async selectByIndex(locator: flexibleLocator, index: number): Promise<void> {
        await this.getLocator(locator).selectOption({ index }, { timeout: this.defaultTimeOut });
        console.log(`Selected option by index: ${index} from: ${locator}`);
    }

    /**
     * Select multiple options in a multi-select dropdown
     */
    async selectMultiple(locator: flexibleLocator, values: string[]): Promise<void> {
        await this.getLocator(locator).selectOption(values, { timeout: this.defaultTimeOut });
        console.log(`Selected multiple options: [${values.join(', ')}] from: ${locator}`);
    }


    // ========================== Wait Utilities ========================== //

    /**
     * Wait for element to be visible
     */
    async waitForElementVisible(locator: flexibleLocator, timeout: number = 5000): Promise<boolean> {
        try {
            await this.getLocator(locator).waitFor({ state: 'visible', timeout });
            console.log(`Element is visible: ${locator}`);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Wait for element to be attached to the DOM
     */
    async waitForElementAttached(locator: flexibleLocator, timeout: number = 5000): Promise<boolean> {
        try {
            await this.getLocator(locator).waitFor({ state: 'attached', timeout });
            console.log(`Element is attached: ${locator}`);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Wait for element to be hidden / detached
     */
    async waitForElementHidden(locator: flexibleLocator, timeout: number = 5000): Promise<boolean> {
        try {
            await this.getLocator(locator).waitFor({ state: 'hidden', timeout });
            console.log(`Element is hidden: ${locator}`);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Wait for element to be detached from the DOM
     */
    async waitForElementDetached(locator: flexibleLocator, timeout: number = 5000): Promise<boolean> {
        try {
            await this.getLocator(locator).waitFor({ state: 'detached', timeout });
            console.log(`Element is detached: ${locator}`);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Wait for element to contain specific text
     */
    async waitForText(locator: flexibleLocator, text: string, timeout: number = this.defaultTimeOut): Promise<void> {
        await expect(this.getLocator(locator)).toContainText(text, { timeout });
        console.log(`Element: ${locator} contains text: "${text}"`);
    }

    /**
     * Wait for page load state
     */
    async waitForPageLoad(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load'): Promise<void> {
        await this.page.waitForLoadState(state);
        console.log(`Waited for page load state: ${state}`);
    }

    /**
     * Wait for a URL pattern (string or regex)
     */
    async waitForURL(urlPattern: string | RegExp, timeout: number = this.defaultTimeOut): Promise<void> {
        await this.page.waitForURL(urlPattern, { timeout });
        console.log(`Page URL matched: ${urlPattern}`);
    }

    /**
     * Wait for a specific network request
     */
    async waitForRequest(urlPattern: string | RegExp): Promise<void> {
        await this.page.waitForRequest(urlPattern, { timeout: this.defaultTimeOut });
        console.log(`Waited for request matching: ${urlPattern}`);
    }

    /**
     * Wait for a specific network response
     */
    async waitForResponse(urlPattern: string | RegExp): Promise<void> {
        await this.page.waitForResponse(urlPattern, { timeout: this.defaultTimeOut });
        console.log(`Waited for response matching: ${urlPattern}`);
    }

    /**
     * Wait for a static timeout (use sparingly - prefer explicit waits)
     */
    async sleep(timeout: number): Promise<void> {
        await this.page.waitForTimeout(timeout);
        console.log(`Waited for ${timeout}ms`);
    }

    /**
     * Wait for an element's attribute to have a specific value
     */
    async waitForAttributeValue(locator: flexibleLocator, attribute: string, value: string, timeout: number = this.defaultTimeOut): Promise<void> {
        await expect(this.getLocator(locator)).toHaveAttribute(attribute, value, { timeout });
        console.log(`Element: ${locator} has attribute "${attribute}" = "${value}"`);
    }

    /**
     * Wait for element count to match expected value
     */
    async waitForElementCount(locator: string, count: number, timeout: number = this.defaultTimeOut): Promise<void> {
        await expect(this.page.locator(locator)).toHaveCount(count, { timeout });
        console.log(`Element count for "${locator}" matched: ${count}`);
    }


    // ========================== Navigation ========================== //

    /**
     * Navigate to a URL
     */
    async navigateTo(url: string): Promise<void> {
        await this.page.goto(url, { timeout: this.defaultTimeOut });
        console.log(`Navigated to: ${url}`);
    }

    /**
     * Reload the current page
     */
    async reloadPage(): Promise<void> {
        await this.page.reload({ timeout: this.defaultTimeOut });
        console.log(`Page reloaded`);
    }

    /**
     * Navigate back in browser history
     */
    async goBack(): Promise<void> {
        await this.page.goBack({ timeout: this.defaultTimeOut });
        console.log(`Navigated back`);
    }

    /**
     * Navigate forward in browser history
     */
    async goForward(): Promise<void> {
        await this.page.goForward({ timeout: this.defaultTimeOut });
        console.log(`Navigated forward`);
    }

    /**
     * Get the current page URL
     */
    getCurrentURL(): string {
        return this.page.url();
    }

    /**
     * Get the current page title
     */
    async getPageTitle(): Promise<string> {
        return await this.page.title();
    }


    // ========================== Alerts & Dialogs ========================== //

    /**
     * Accept an alert / confirm / prompt dialog
     */
    async acceptDialog(promptText?: string): Promise<void> {
        this.page.once('dialog', async (dialog) => {
            console.log(`Accepting dialog: "${dialog.message()}"`);
            await dialog.accept(promptText);
        });
    }

    /**
     * Dismiss a dialog (Cancel)
     */
    async dismissDialog(): Promise<void> {
        this.page.once('dialog', async (dialog) => {
            console.log(`Dismissing dialog: "${dialog.message()}"`);
            await dialog.dismiss();
        });
    }

    /**
     * Get the message of the current dialog
     */
    async getDialogMessage(): Promise<string> {
        return new Promise((resolve) => {
            this.page.once('dialog', async (dialog) => {
                const message = dialog.message();
                await dialog.dismiss();
                resolve(message);
            });
        });
    }


    // ========================== Frames & iFrames ========================== //

    /**
     * Get a FrameLocator by selector
     */
    getFrameLocator(frameSelector: string): FrameLocator {
        return this.page.frameLocator(frameSelector);
    }

    /**
     * Click on an element inside an iframe
     */
    async clickInsideFrame(frameSelector: string, elementSelector: string): Promise<void> {
        await this.page.frameLocator(frameSelector).locator(elementSelector).click({ timeout: this.defaultTimeOut });
        console.log(`Clicked inside frame: ${frameSelector} on element: ${elementSelector}`);
    }

    /**
     * Fill text inside an iframe
     */
    async fillInsideFrame(frameSelector: string, elementSelector: string, text: string): Promise<void> {
        await this.page.frameLocator(frameSelector).locator(elementSelector).fill(text, { timeout: this.defaultTimeOut });
        console.log(`Filled "${text}" inside frame: ${frameSelector} on element: ${elementSelector}`);
    }

    /**
     * Get text from inside an iframe
     */
    async getTextInsideFrame(frameSelector: string, elementSelector: string): Promise<string> {
        return (await this.page.frameLocator(frameSelector).locator(elementSelector).innerText({ timeout: this.defaultTimeOut })).trim();
    }


    // ========================== New Tab / Window ========================== //

    /**
     * Click a link and capture the newly opened page/tab
     */
    async clickAndGetNewPage(locator: flexibleLocator): Promise<Page> {
        const [newPage] = await Promise.all([
            this.page.context().waitForEvent('page'),
            this.click(locator)
        ]);
        await newPage.waitForLoadState('load');
        console.log(`New page opened: ${newPage.url()}`);
        return newPage;
    }

    /**
     * Get all open pages in the context
     */
    getAllPages(): Page[] {
        return this.page.context().pages();
    }

    /**
     * Switch to a page by index in the context
     */
    getPageByIndex(index: number): Page {
        const pages = this.page.context().pages();
        if (index >= pages.length) throw new Error(`Page index ${index} is out of range. Total pages: ${pages.length}`);
        return pages[index];
    }


    // ========================== Screenshots ========================== //

    /**
     * Take a full-page screenshot and save to a path
     */
    async takeFullPageScreenshot(path: string): Promise<void> {
        await this.page.screenshot({ path, fullPage: true });
        console.log(`Full-page screenshot saved to: ${path}`);
    }

    /**
     * Take a screenshot of a specific element
     */
    async takeElementScreenshot(locator: flexibleLocator, path: string): Promise<void> {
        await this.getLocator(locator).screenshot({ path, timeout: this.defaultTimeOut });
        console.log(`Element screenshot saved to: ${path}`);
    }


    // ========================== JavaScript Execution ========================== //

    /**
     * Execute JavaScript in the context of the page
     */
    async executeScript<T>(script: string, ...args: unknown[]): Promise<T> {
        const result = await this.page.evaluate(script, ...args) as T;
        console.log(`Executed script: ${script}`);
        return result;
    }

    /**
     * Execute JavaScript in the context of a specific element
     */
    async executeScriptOnElement<T>(locator: flexibleLocator, script: (el: Element, args: unknown[]) => T, args: unknown[] = []): Promise<T> {
        return await this.getLocator(locator).evaluate(script, args) as T;
    }

    /**
     * Force-set value on an input field via JavaScript (for React/Angular-controlled inputs)
     */
    async setValueViaJS(locator: flexibleLocator, value: string): Promise<void> {
        await this.getLocator(locator).evaluate((el, val) => {
            (el as HTMLInputElement).value = val;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }, value);
        console.log(`Set value "${value}" via JS on element: ${locator}`);
    }

    /**
     * Scroll element into view via JavaScript
     */
    async scrollIntoViewViaJS(locator: flexibleLocator): Promise<void> {
        await this.getLocator(locator).evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        console.log(`Scrolled element into view via JS: ${locator}`);
    }


    // ========================== Clipboard ========================== //

    /**
     * Get clipboard text content (requires 'clipboard-read' permission)
     */
    async getClipboardText(): Promise<string> {
        return await this.page.evaluate(() => navigator.clipboard.readText());
    }

    /**
     * Set clipboard text content (requires 'clipboard-write' permission)
     */
    async setClipboardText(text: string): Promise<void> {
        await this.page.evaluate((t) => navigator.clipboard.writeText(t), text);
        console.log(`Set clipboard text: "${text}"`);
    }


    // ========================== Downloads ========================== //

    /**
     * Trigger a download by clicking an element and return the Download object
     */
    async clickAndDownload(locator: flexibleLocator): Promise<Download> {
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.click(locator)
        ]);
        console.log(`Download triggered: ${download.suggestedFilename()}`);
        return download;
    }

    /**
     * Save a downloaded file to a specified path
     */
    async saveDownload(download: Download, savePath: string): Promise<void> {
        await download.saveAs(savePath);
        console.log(`Download saved to: ${savePath}`);
    }


    // ========================== Local Storage & Cookies ========================== //

    /**
     * Set a value in localStorage
     */
    async setLocalStorageItem(key: string, value: string): Promise<void> {
        await this.page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value]);
        console.log(`Set localStorage: "${key}" = "${value}"`);
    }

    /**
     * Get a value from localStorage
     */
    async getLocalStorageItem(key: string): Promise<string | null> {
        return await this.page.evaluate((k) => localStorage.getItem(k), key);
    }

    /**
     * Remove an item from localStorage
     */
    async removeLocalStorageItem(key: string): Promise<void> {
        await this.page.evaluate((k) => localStorage.removeItem(k), key);
        console.log(`Removed localStorage key: "${key}"`);
    }

    /**
     * Clear all localStorage
     */
    async clearLocalStorage(): Promise<void> {
        await this.page.evaluate(() => localStorage.clear());
        console.log(`Cleared localStorage`);
    }

    /**
     * Get all cookies for the current page
     */
    async getCookies(): Promise<{ name: string; value: string }[]> {
        return await this.page.context().cookies();
    }

    /**
     * Clear all cookies in the browser context
     */
    async clearCookies(): Promise<void> {
        await this.page.context().clearCookies();
        console.log(`Cleared all cookies`);
    }


    // ========================== Assertions (Soft Helpers) ========================== //

    /**
     * Assert element is visible
     */
    async assertVisible(locator: flexibleLocator, timeout: number = this.defaultTimeOut): Promise<void> {
        await expect(this.getLocator(locator)).toBeVisible({ timeout });
    }

    /**
     * Assert element is hidden
     */
    async assertHidden(locator: flexibleLocator, timeout: number = this.defaultTimeOut): Promise<void> {
        await expect(this.getLocator(locator)).toBeHidden({ timeout });
    }

    /**
     * Assert element has exact text
     */
    async assertText(locator: flexibleLocator, expectedText: string, timeout: number = this.defaultTimeOut): Promise<void> {
        await expect(this.getLocator(locator)).toHaveText(expectedText, { timeout });
    }

    /**
     * Assert element contains text
     */
    async assertContainsText(locator: flexibleLocator, expectedText: string, timeout: number = this.defaultTimeOut): Promise<void> {
        await expect(this.getLocator(locator)).toContainText(expectedText, { timeout });
    }

    /**
     * Assert element has specific attribute value
     */
    async assertAttributeValue(locator: flexibleLocator, attribute: string, value: string, timeout: number = this.defaultTimeOut): Promise<void> {
        await expect(this.getLocator(locator)).toHaveAttribute(attribute, value, { timeout });
    }

    /**
     * Assert input field has a specific value
     */
    async assertInputValue(locator: flexibleLocator, expectedValue: string, timeout: number = this.defaultTimeOut): Promise<void> {
        await expect(this.getLocator(locator)).toHaveValue(expectedValue, { timeout });
    }

    /**
     * Assert element is enabled
     */
    async assertEnabled(locator: flexibleLocator, timeout: number = this.defaultTimeOut): Promise<void> {
        await expect(this.getLocator(locator)).toBeEnabled({ timeout });
    }

    /**
     * Assert element is disabled
     */
    async assertDisabled(locator: flexibleLocator, timeout: number = this.defaultTimeOut): Promise<void> {
        await expect(this.getLocator(locator)).toBeDisabled({ timeout });
    }

    /**
     * Assert element is checked
     */
    async assertChecked(locator: flexibleLocator, timeout: number = this.defaultTimeOut): Promise<void> {
        await expect(this.getLocator(locator)).toBeChecked({ timeout });
    }

    /**
     * Assert current page URL contains a string
     */
    async assertURLContains(expectedPart: string, timeout: number = this.defaultTimeOut): Promise<void> {
        await expect(this.page).toHaveURL(new RegExp(expectedPart), { timeout });
    }

    /**
     * Assert page title equals expected
     */
    async assertPageTitle(expectedTitle: string, timeout: number = this.defaultTimeOut): Promise<void> {
        await expect(this.page).toHaveTitle(expectedTitle, { timeout });
    }

    /**
     * Assert element count
     */
    async assertElementCount(locator: string, count: number, timeout: number = this.defaultTimeOut): Promise<void> {
        await expect(this.page.locator(locator)).toHaveCount(count, { timeout });
    }

    /**
     * Assert element has a specific CSS class
     */
    async assertHasClass(locator: flexibleLocator, className: string, timeout: number = this.defaultTimeOut): Promise<void> {
        await expect(this.getLocator(locator)).toHaveClass(new RegExp(className), { timeout });
    }

    /**
     * Assert element has a specific CSS value
     */
    async assertCSSProperty(locator: flexibleLocator, property: string, value: string, timeout: number = this.defaultTimeOut): Promise<void> {
        await expect(this.getLocator(locator)).toHaveCSS(property, value, { timeout });
    }
}