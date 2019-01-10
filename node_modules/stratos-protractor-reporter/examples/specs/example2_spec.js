var PageObject = require('./PageObject.js');

describe('angularjs homepage 2', function () {
    var page;

    beforeEach(function () {
        page = new PageObject();
        browser.get('http://www.angularjs.org');
    });

    it('should fail as greeting text is different 2', function () {
        page.yourNameInputField.sendKeys('Julie');
        expect(page.greetingText.getText()).toEqual('Hello Julie hello!');
    });

    it('should greet the named user 2', function () {
        page.yourNameInputField.sendKeys('Julie');
        expect(page.greetingText.getText()).toEqual('Hello Julie!');
    });

    it('should contain log and pretty stack trace2', function () {
        browser.executeScript("console.warn('This is some kind of warning!');");
        browser.executeScript("console.info('This is some kind of information!');");
        browser.executeScript("console.error('This is some kind of warning!');");

        browser.executeScript("arguments[0].addEventListener('click', function() { return throw new TypeError('type error'); })", page.addButton);
        page.addButton.click();

        page.yourNameInputField.sendKeys('Julie');
        expect(page.greetingText.getText()).toEqual('Hello Julie hello!');
    });

    describe('todo list 2', function () {

        it('should list todos 2', function () {
            expect(page.todoList.count()).toEqual(2);
        });

        it('should display first todo with proper text 2', function () {
            expect(page.todoList.get(1).getText()).toEqual('build an AngularJS app');
        });

        it('should add a todo 2', function () {
            page.addTodo.sendKeys('write a protractor test');
            page.addButton.click();
            expect(page.todoList.count()).toEqual(3);
            expect(page.todoList.get(2).getText()).toEqual('write a protractor test');
        });

        xit('should be displayed as pending test case 2', function () {
            expect(page.todoList.get(1).getText()).toEqual('build an AngularJS app');
        });
    });

    xdescribe('pending describe 2', function () {

        it('pending test case 1 2', function () {
        });

        it('pending test case 2 2', function () {
        });

    });
});