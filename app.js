const mongoose = require('mongoose');
const {
    program
} = require('@caporal/core');
const prompt = require("prompt");
mongoose.connect('mongodb://localhost/todo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// for test connection with
const testConnection = () => {
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log("hoorayyy");
    });
}


const todoSchema = new mongoose.Schema({
    kegiatan: String,
    cek: {
        type: Boolean,
        default: false
    }
});

const todoModel = new mongoose.model('todoModel', todoSchema);

const callback = (error, result) => {
    console.log(error, result);
}


const showList = async () => {
    const listTodo = await todoModel.find();
    Object.values(listTodo).forEach(val => {
        if (val.cek == true) {
            console.log(`${val._id} ${val.kegiatan} (Done)`);
        } else {
            console.log(val._id, val.kegiatan);
        }

    })

    mongoose.disconnect();
}

program
    .command("list", "show list")
    .action(() => {
        showList();
    })


//todo add "kegiatan"

program
    .command("add", "add todo")
    .argument("<add>", "add todo")
    .action(({
        args
    }) => {
        (async () => {
            const todo = new todoModel({
                kegiatan: args.add
            }, callback);
            await todo.save();
            showList();
        })();
    })


//todo update <id> "kegiatan"

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

//todo del <id>

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

//todo clear
//hapus semua todo
program
    .command("clear", "clear todo")
    .action(() => {

        console.log("Are you sure want to delete? [y/N]");
        prompt.get("answer", function (err, res) {
            if (res.answer == "y" || res.answer == "Y") {
                (async () => {
                    await todoModel.deleteMany({}, callback)
                    showList();
                })();
            } else if (res.answer == "n" || res.answer == "N") {
                console.log("Clear canceled");
                mongoose.disconnect();
            } else {
                console.log(`Error : ${err}`);
            }
        });

    })

//todo done <id>
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

//todo undone <id>
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