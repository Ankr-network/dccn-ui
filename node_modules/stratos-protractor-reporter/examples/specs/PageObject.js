var PageObject = function()
{
    this.yourNameInputField = element(by.model('yourName'));
    this.greetingText = element(by.binding('yourName'));
    this.todoList = element.all(by.repeater('todo in todoList.todos'));
    this.addTodo = element(by.model('todoList.todoText'));
    this.addButton = element(by.css('[value="add"]'));
};

module.exports = PageObject;