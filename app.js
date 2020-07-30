const mongoose = require('mongoose');
const {
    program
} = require('@caporal/core');
const prompt = require("prompt");
mongoose.connect('mongodb://localhost/todo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// for test connection with mongo
// const testConnection = () => {
//     const db = mongoose.connection;
//     db.on('error', console.error.bind(console, 'connection error: '));
//     db.once('open', function () {
//         console.log("success");
//     });
// }


/**
 * Reference from Panca Putra Pahlawan
 * Refactor some code to be readable
 * change id number 1 to 100 when adding some text
 */

const todoSchema = new mongoose.Schema({
    kegiatan: String,
    cek: {
        type: Boolean,
        default: false
    },
    _id: {
        type: Number,
        default: 1
    }
});

const todoModel = new mongoose.model('todoModel', todoSchema);

const callback = (error, result) => {
    console.log(error, result);
}


const showList = async () => {
    const listTodo = await todoModel.find();
    Object.values(listTodo).forEach(val => {
        val.cek === true ? console.log(`ID: ${val._id} | Text: ${val.kegiatan} (Done)`) :
            console.log(`ID: ${val._id} | Text: ${val.kegiatan}`);
    })

    mongoose.disconnect();
}


/**
 * node app list
 */
program
    .command("list", "show list")
    .action(() => {
        showList();
    })


/**
 * node app add "text"
 */
program
    .command("add", "add todo")
    .argument("<add>", "add todo")
    .action(({
        args
    }) => {
        (async () => {
            const todo = new todoModel({
                _id: Number
            }, {
                kegiatan: args.add,
            }, callback);
            todo._id = Math.floor(Math.random() * 100) + 1
            todo.kegiatan = args.add
            await todo.save();
            showList();
        })();
    })



/**
 * node app update "id" "new text"
 */
program
    .command("update", "update todo")
    .argument("<id>")
    .argument("<update>", "update todo")
    .action(({
        args
    }) => {
        (async () => {
            await todoModel.updateOne({
                    _id: args.id
                }, {
                    kegiatan: args.update
                },
                callback
            )
            showList();
        })();


    })

/**
 * node app del "id"
 */
program
    .command("del", "del todo")
    .argument("<id>")
    .action(({
        args
    }) => {
        (async () => {
            await todoModel.deleteOne({
                _id: args.id
            }, callback)
            showList();
        })();


    })


/**
 * node app update "id" "new text"
 */
program
    .command("clear", "clear todo")
    .action(() => {

        console.log("Are you sure want to delete? [y/N]");
        prompt.get("answer", function (err, res) {
            let yesAnswer = res.answer.toLowerCase()
            let noAnswer = res.answer.toLowerCase()
            if (yesAnswer === "y") {
                (async () => {
                    await todoModel.deleteMany({}, callback)
                    showList();
                })();
            } else if (noAnswer === "n") {
                console.log("Clear canceled");
                mongoose.disconnect();
            } else {
                console.log(`Error : ${err}`);
            }
        });

    })

/**
 * node app done "id"
 */
program
    .command("done", "done todo")
    .argument("<id>")
    .action(({
        args
    }) => {
        (async () => {
            await todoModel.updateOne({
                    _id: args.id
                }, {
                    cek: true
                },
                callback
            )
            showList();
        })();


    })


/**
 * node app undone "id"
 */
program
    .command("undone", "undone todo")
    .argument("<id>")
    .action(({
        args
    }) => {
        (async () => {
            await todoModel.updateOne({
                    _id: args.id
                }, {
                    cek: false
                },
                callback
            )
            showList();
        })();


    })


program.run()