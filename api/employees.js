const express = require('express');
const sqlite3 = require('sqlite3');
const employeesRouter = express.Router();
const timeSheetsRouter = require('./timesheets');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

// Route parameters:

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
    const sql = `SELECT * FROM Employee WHERE id = ${employeeId}`
    db.get(sql, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.employee = row;
            next();
          } else {
            res.sendStatus(404);
          }
    });
});

employeesRouter.use('/:employeeId/timesheets', timeSheetsRouter);

// employees routes:

employeesRouter.get('/', (req, res, next) => {
    const sql = `SELECT * FROM Employee WHERE is_current_employee = 1`
    db.all(sql, (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({employees: rows})
        }
    });
});

employeesRouter.post('/', (req, res, next) => {
    const name = req.body.employee.name
    const position = req.body.employee.position
    const wage = req.body.employee.wage
    const sql = `INSERT INTO Employee 
                (name, position, wage)
                VALUES ($name, $position, $wage)`
    const values = {
        $name: name,
        $position: position,
        $wage: wage
    }

    if(!name || !position || !wage) {
        return res.sendStatus(400);
    } else {
        db.run(sql, values, function(err) {
            if(err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Employee where id = ${this.lastID}`, (err, row) => {
                    if(err) {
                        next(err);
                    } else {
                        res.status(201).json({employee: row});
                    };
                });   
            };
        });
    };
});

// :employeeId routes:

employeesRouter.get('/:employeeId', (req, res, next) => {
    const id = req.params.employeeId;
    const sql = `SELECT * FROM Employee WHERE id = ${id}`
    db.get(sql, (err, row) => {
        if(err) {
            next(err);
        } else if (!row) {
            res.sendStatus(404);
        } else {
            res.status(200).json({employee: row});
        }
    });
});


employeesRouter.put('/:employeeId', (req, res, next) => {
    const name = req.body.employee.name
    const position = req.body.employee.position
    const wage = req.body.employee.wage
    const id = req.params.employeeId;
    const sql = `UPDATE Employee
                SET name = $name,
                position = $position,
                wage = $wage
                WHERE id = $id;`;
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $id: id
    }

    if(!name || !position || !wage) {
        res.sendStatus(400);
    } else {
        db.run(sql, values, function(err) {
            if(err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Employee WHERE id = ${id};`, (err, row) => {
                    if(err) {
                        next(err);
                    } else {
                        res.status(200).json({employee: row});
                    }
                });
            };
        });
    };
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
    const id = req.params.employeeId;
    const sql = `UPDATE Employee
                SET is_current_employee = 0
                WHERE id = $id;`
    const values = {
        $id: id
    }
    db.run(sql, values, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${id};`, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(200).json({employee: row});
                };
            });
        };
    });
});

module.exports = employeesRouter;