const express = require('express');
const sqlite3 = require('sqlite3');
const timeSheetsRouter = express.Router({mergeParams: true});

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

//Route Parameters

timeSheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
    const sql = `SELECT * FROM Timesheet WHERE id = ${timesheetId}`
    db.get(sql, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.timesheet = row;
            next();
          } else {
            res.sendStatus(404);
          }
    });
});

// timesheets routes

timeSheetsRouter.get('/', (req, res, next) => {
    const id = req.params.employeeId
    const sql = `SELECT * FROM Timesheet WHERE employee_id = ${id};`
    db.all(sql, (err, rows) => {
        if(err) {
            next(err);
        } else {
            res.status(200).json({timesheets: rows})
        }
    });
});

timeSheetsRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours
    const rate = req.body.timesheet.rate
    const date = req.body.timesheet.date
    const employeeId = req.employee.id
    const sql = `INSERT INTO Timesheet
                (hours, rate, date, employee_id)
                VALUES ($hours, $rate, $date, $employeeId);`;
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId
    }

    if(!hours || !rate || !date) {
        return res.sendStatus(400);
    }

    db.run(sql, values, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID};`, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(201).json({timesheet: row});
                };
            });
        };
    });
});

// :timesheetId routes

timeSheetsRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours
    const rate = req.body.timesheet.rate
    const date = req.body.timesheet.date
    const timesheetId = req.params.timesheetId
    const sql = `UPDATE Timesheet
                SET hours = $hours, 
                rate = $rate, 
                date = $date
                WHERE id = $timesheetId;`;
    const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $timesheetId: timesheetId
    }

    if(!hours || !rate || !date) {
        return res.sendStatus(400);
    }

    db.run(sql, values, function(err) {
        if(err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE id = ${timesheetId}`, (err, row) => {
                if(err) {
                    next(err);
                } else {
                    res.status(200).json({timesheet: row});
                }
            });
        };
    });
});

timeSheetsRouter.delete('/:timesheetId', (req, res, next) => {
    const id = req.params.timesheetId;
    const sql = `DELETE FROM Timesheet WHERE id = $id;`
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

module.exports = timeSheetsRouter;