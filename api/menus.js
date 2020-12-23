const express = require('express');
const sqlite3 = require('sqlite3');
const menusRouter = express.Router();
const menuItemsRouter = require('./menuItems');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

// Router Parameters:

menusRouter.param('menuId', (req, res, next, menuId) => {
    const sql = `SELECT * FROM Menu WHERE id = ${menuId}`
    db.get(sql, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.menu = row;
            next();
          } else {
            res.sendStatus(404);
          }
    });
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

// menus Routes:

menusRouter.get('/', (req, res, next) => {
    const sql = `SELECT * FROM menu`
    db.all(sql, (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({menus: rows})
        }
    });
});

menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title
    const sql = `INSERT INTO Menu 
                (title)
                VALUES ($title)`
    const values = {$title: title}

    if(!title) {
        return res.sendStatus(400);
    } else {
        db.run(sql, values, function(err) {
            if(err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Menu where id = ${this.lastID}`, (err, row) => {
                    if(err) {
                        next(err);
                    } else {
                        res.status(201).json({menu: row});
                    };
                });   
            };
        });
    };
});

// :menuId Routes:

menusRouter.get('/:menuId', (req, res, next) => {
    const id = req.params.menuId;
    const sql = `SELECT * FROM Menu WHERE id = ${id}`
    db.get(sql, (err, row) => {
        if(err) {
            next(err);
        } else if (!row) {
            res.sendStatus(404);
        } else {
            res.status(200).json({menu: row});
        }
    });
});

menusRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title
    const id = req.params.menuId;
    const sql = `UPDATE Menu
                SET title = $title
                WHERE id = $id;`;
    const values = {
        $title: title,
        $id: id
    }

    if(!title) {
        res.sendStatus(400);
    } else {
        db.run(sql, values, function(err) {
            if(err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Menu WHERE id = ${id};`, (err, row) => {
                    if(err) {
                        next(err);
                    } else {
                        res.status(200).json({menu: row});
                    }
                });
            };
        });
    };
});

menusRouter.delete('/:menuId', (req, res, next) => {
    const menuId = req.params.menuId;
    db.all(`SELECT * FROM MenuItem WHERE menu_id = ${menuId}`, (err, rows) => {
        if(err) {
            next(err)
        } else if(rows.length == 0) {
            db.run(`DELETE FROM Menu WHERE id = $id;`, {$id: menuId}, function(err) {
                if(err) {
                    next(err);
                } else {
                    res.sendStatus(204);
                };
            });
        } else {
            res.sendStatus(400);
        }
    });
});


module.exports = menusRouter;