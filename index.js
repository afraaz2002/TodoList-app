import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";

let app = express();
let port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

let _todos = [];

mongoose.connect('mongodb://127.0.0.1:27017/todoListDB');
// mongoose.connect('mongodb+srv://afraazkhan2002:Affu2002$@cluster0.tef07lx.mongodb.net/todoListDB');
const todoSchema = { name: String };

const Todo = mongoose.model("Todo", todoSchema);

const listSchema = {
    name: String,
    newTodos: [todoSchema]
}

const NewList = mongoose.model("List", listSchema);
// const sampleTodos = [{ name: "Prayer" }, { name: "Brush your teeth" }]; default todos

app.get("/", (req, res) => {
    const insertingTodos = async () => {
        try {
            _todos = await Todo.find({});
            res.render("index.ejs", { title: "Todo", todos: _todos });

        } catch (err) {
            console.log("Problem faced during fetching data " + err);
        }
    }
    insertingTodos();

})

app.get("/:page", (req, res) => {
    const page = _.capitalize(req.params.page);
    if (page !== "Favicon.ico") {

        // console.log(page);
        const newTodoList = async () => {
            try {
                let searchList = await NewList.findOne({ name: page });
                if (searchList === null) {

                    let newItems = {
                        name: page,
                        newTodos: []
                    }
                    NewList.create(newItems);
                    res.redirect("/" + newItems.name);
                }
                else {
                    res.render("index.ejs", { title: searchList.name, todos: searchList.newTodos })
                }
            } catch (err) {
                console.log("An error occured :" + err);
            }

        }
        newTodoList();
    }
})

app.post("/", (req, res) => {
    let list = req.body.newList;
    let newTodo = req.body.newTodo;

    console.log(list);
    if (list === "Todo") {
        let todo = { name: newTodo };
        Todo.create(todo);

        res.redirect("/");

    } else {
        const newListPage = async () => {
            try {
                let pageList = await NewList.findOne({ name: list });
                pageList.newTodos.push({ name: newTodo });
                await pageList.save();
                // console.log(pageList.newTodos);

                res.redirect("/" + list);
            } catch (err) {
                console.log("An error occurred " + err);
            }
        }
        newListPage();
    }
})

app.post("/delete", (req, res) => {
        let delId = req.body.deleteTodo;
        let listName = req.body.listName;
        // console.log(delId);

        if(listName === "Todo")
        {
            const todoDelete = async () => {
                await Todo.findByIdAndDelete(delId);
            }
            todoDelete();
            res.redirect("/");
        }
        else{
            const listTodoDelete = async () => {
                let listTodo = await NewList.findOne({name:listName});
                listTodo.newTodos.pull({ _id:delId });
                await listTodo.save();
                // console.log(listTodo.newTodos);

                res.redirect("/" + listName);

            }
            listTodoDelete();
        }

})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})

//code to add default todos/data
// const insertingTodos = async () => {
//     try {
//         _todos = await Todo.find({});
//         if (_todos.length === 0) {
//             Todo.insertMany(sampleTodos);
//             res.redirect("/");
//         }
//         else {
//             res.render("index.ejs", { todos: _todos });
//             // console.log(_todos);
//         }
//     } catch (err) {
//         console.log("problem faced during executing! " + err);
//     }
// }
// insertingTodos();