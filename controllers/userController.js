const { validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const dbConnection = require("../utils/dbConnection");

// Home Page
exports.homePage = async (req, res, next) => {
    const [row] = await dbConnection.execute("SELECT * FROM `users` WHERE `id`=?", [req.session.userID]);
    
    if (row.length !== 1) {
        return res.redirect('/logout');
    }

    res.render('home', {
        user: row[0],
        username: row[0].name
        
    });
}
exports.settingsPage = async (req, res, next) => {
    const [row] = await dbConnection.execute("SELECT * FROM `users` WHERE `id`=?", [req.session.userID]);
    
    if (row.length !== 1) {
        return res.redirect('/logout');
    }

    res.render('settings', {
        user: row[0],
        username: row[0].name,
        
        
    });
}
exports.emailchange = async (req, res, next) => {
    const errors = validationResult(req);
    const { body } = req;
    
    if (!errors.isEmpty()) {
        return res.render('settings', {
            error: errors.array()[0].msg
        });
    }

    try {

        
        const [row] = await dbConnection.execute("SELECT * FROM `users` WHERE `id`=?", [req.session.userID]);
        const [rowss] = await dbConnection.execute(
            "SELECT * FROM `users` WHERE `email`=?",
            [body._changemail]
        );
        if(row.email == body._changemail) return
        if(rowss.length >= 1){
            return res.render('settings',{
                error: 'Email already in use',
                user: row[0],
                username: row[0].name
            })
        }
        if (row.length != 1) {
            return res.render('settings', {
                error: 'Invalid email',
                user: row[0],
                username: row[0].name
            });
        }
        const mail = await dbConnection.execute("UPDATE users SET email = ? WHERE id = ?;", [body._changemail, req.session.userID])
        const [row2] = await dbConnection.execute("SELECT * FROM `users` WHERE `id`=?", [req.session.userID]);
        res.render('settings', {
            msg: 'You have successfully changed email',
            user: row2[0],
            username: row2[0].name
        })

    }
    catch (e) {
        next(e);
    }
}
exports.passwordchange = async(req, res, next) => {
    
    const { body } = req;
    if(body.oldpass == "")return
}
// Register Page
exports.registerPage = (req, res, next) => {
    res.render("register");
};

// User Registration
exports.register = async (req, res, next) => {
    const errors = validationResult(req);
    const { body } = req;

    if (!errors.isEmpty()) {
        return res.render('register', {
            error: errors.array()[0].msg
        });
    }

    try {

        const [row] = await dbConnection.execute(
            "SELECT * FROM `users` WHERE `email`=?",
            [body._email]
        );

        if (row.length >= 1) {
            return res.render('register', {
                error: 'This email already in use.'
            });
        }

        const hashPass = await bcrypt.hash(body._password, 12);

        const [rows] = await dbConnection.execute(
            "INSERT INTO `users`(`name`,`email`,`password`) VALUES(?,?,?)",
            [body._name, body._email, hashPass]
        );

        if (rows.affectedRows !== 1) {
            return res.render('register', {
                error: 'Your registration has failed.'
            });
        }
        
        res.render("register", {
            msg: 'You have successfully registered.'
        });

    } catch (e) {
        next(e);
    }
};

// Login Page
exports.loginPage = (req, res, next) => {
    res.render("login");
    console.log(bcrypt.getSalt("$2a$12$LyZmwaPab6mDlRPLFlzwOusTtthDR/h/AOxifSI.0Vq3yVeCdRDtW"))
};

// Login User
exports.login = async (req, res, next) => {
    
    const errors = validationResult(req);
    const { body } = req;

    if (!errors.isEmpty()) {
        return res.render('login', {
            error: errors.array()[0].msg
        });
    }

    try {

        const [row] = await dbConnection.execute('SELECT * FROM `users` WHERE `email`=?', [body._email]);

        if (row.length != 1) {
            return res.render('login', {
                error: 'Invalid email address.'
            });
        }

        const checkPass = await bcrypt.compare(body._password, row[0].password);
        
        if (checkPass === true) {
            req.session.userID = row[0].id;
            
            return res.redirect('/');
            
        }

        res.render('login', {
            error: 'Invalid Password.'
        });


    }
    catch (e) {
        next(e);
    }

}