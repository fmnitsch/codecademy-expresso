const express = require('express');
const sqlite3 = require('sqlite3');
const menuItemsRouter = express.Router({mergeParams: true});

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

// Router Parameter:

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    const sql = `SELECT * FROM MenuItem WHERE id = ${menuItemId}`
    db.get(sql, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.menuItem = row;
            next();
          } else {
            res.sendStatus(404);
          }
    });
});

// menu-items Routes:

menuItemsRouter.get('/', (req, res, next) => {
    const sql = `SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`
    db.all(sql, (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({menuItems: rows})
        }
    });
});

menuItemsRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name
    const inventory = req.body.menuItem.inventory
    const price = req.body.menuItem.price
    const description = req.body.menuItem.description
    const menuId = req.menu.id
    const sql = `INSERT INTO MenuItem
                (name, description, inventory, price, menu_id)
                VALUES ($name, $description, $inventory, $price, $menuId);`;
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: menuId
    }

    if(!name || !inventory || !price) {
        return res.sendStatus(400);
    }

    db.run(sql, values, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID};`, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(201).json({menuItem: row});
                };
            });
        };
    });
});

// :menuItemId Routes:

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name
    const inventory = req.body.menuItem.inventory
    const price = req.body.menuItem.price
    const description = req.body.menuItem.description
    const menuItemId = req.menuItem.id
    const sql = `UPDATE MenuItem
                SET name = $name, 
                inventory = $inventory, 
                price = $price,
                description = $description
                WHERE id = $menuItemId;`;
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuItemId: menuItemId
    }

    if(!name || !inventory || !price) {
        return res.sendStatus(400);
    }

    db.run(sql, values, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id = ${menuItemId}`, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(200).json({menuItem: row});
                }
            });
        };
    });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    const id = req.params.menuItemId;
    const sql = `DELETE FROM MenuItem WHERE id = $id;`
    const values = {
        $id: id
    }
    db.run(sql, values, function(err) {
        if(err) {
            next(err);
        } else {
            res.sendStatus(204);
        };
    });
});

module.exports = menuItemsRouter;